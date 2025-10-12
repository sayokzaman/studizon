<?php

namespace App\Http\Controllers;

use App\Models\Short;
use App\Models\ShortAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShortController extends Controller
{
    /**
     * GET /shorts/feed
     * Returns a small batch (e.g., 5) of shorts for vertical swiping.
     * Cursor-based pagination for smooth infinite feed.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Simple feed: newest first, excluding the user’s own if you want
        $query = Short::query()
            ->when($request->boolean('excludeMine', false), fn ($q) => $q->where('creator_id', '!=', $user->id))
            ->orderByDesc('id')
            ->with('creator', 'course');

        // Cursor pagination
        $perPage = (int) $request->integer('perPage', 5);
        $paginator = $query->cursorPaginate($perPage);

        return Inertia::render('shorts/index', [
            'initial' => $paginator->items(),     // array of Short
            'cursor' => $paginator->nextCursor()?->encode(),
        ]);
    }

    /**
     * POST /shorts
     * Create a short; deduct small credit cost here (no transactions table yet).
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'prompt' => 'required|string|max:500',
            'payload' => 'required|array',
            'validate' => 'required|array',
            'background' => 'nullable|string|max:255',
            'time_limit' => 'nullable|integer|min:5|max:60',
            'max_points' => 'nullable|integer|min:1|max:10',
            'visibility' => 'nullable|in:public,program_only',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:32',
        ]);

        // Hardcode type for now (mcq only)
        $type = 'mcq';
        $this->assertTypePayload($type, $data['payload'], $data['validate']);

        // (Optional) deduct credits here

        $short = Short::create([
            'creator_id' => $user->id,
            'course_id' => $data['course_id'],
            'type' => $type,
            'prompt' => $data['prompt'],
            'payload' => $data['payload'],
            'validate' => $data['validate'],
            'background' => $data['background'] ?? null,
            'time_limit' => $data['time_limit'] ?? 15,
            'max_points' => $data['max_points'] ?? 1,
            'visibility' => $data['visibility'] ?? 'public',
            'tags' => $data['tags'] ?? [],
        ]);

        return redirect()->route('shorts.index')->with('success', 'Short created!');
    }

    /**
     * POST /shorts/{short}/attempt
     * Evaluate a user’s attempt, write attempt row, and (optionally) award credits.
     */
    public function attempt(Request $request, Short $short)
    {
        $user = $request->user();

        $input = $request->validate([
            'answer' => 'required', // for MCQ: index
            'time_taken' => 'sometimes|integer|min:0|max:600',
        ]);

        [$isCorrect, $normAnswer] = $this->evaluate($short, $input['answer']);
        $points = $isCorrect ? $short->max_points : 0;

        $attempt = ShortAttempt::create([
            'short_id' => $short->id,
            'user_id' => $user->id,
            'answer' => $normAnswer, // store the index
            'is_correct' => $isCorrect,
            'time_taken' => (int) ($input['time_taken'] ?? 0),
            'points_awarded' => $points,
        ]);

        // Optional: inline reward (+1 credit with cap)
        $canonical = null;
        if ($short->type === 'mcq') {
            $canonical = $short->validate['correctIndex'] ?? null;
        } elseif ($short->type === 'true_false') {
            $canonical = (bool) $short->validate['answer'];
        } elseif (in_array($short->type, ['one_word', 'code_output'])) {
            $canonical = $short->validate['answers'][0] ?? null;
        } elseif ($short->type === 'one_number') {
            $canonical = $short->validate['exact'];
        }

        return back()->with([
            'attempt' => [
                'is_correct' => $attempt->is_correct,
                'points_awarded' => $attempt->points_awarded,
                'correct' => $canonical, // <- index/bool/string/number depending on type
            ],
        ]);
    }

    /* ------------------------- Helpers ------------------------- */

    /**
     * Quick per-type shape checks to keep junk out.
     */
    /**
     * Validate the shape of payload/validate for each type.
     * MCQ supports text and/or image choices.
     */
    private function assertTypePayload(string $type, array $payload, array $validate): void
    {
        switch ($type) {
            case 'mcq':
                // payload.choices: array of { text?:string|null, img?:string|null, alt?:string|null }
                if (! isset($payload['choices']) || ! is_array($payload['choices']) || count($payload['choices']) < 2) {
                    abort(422, 'mcq requires payload.choices with at least 2 options.');
                }
                foreach ($payload['choices'] as $i => $c) {
                    if (! is_array($c)) {
                        abort(422, "mcq choice #$i must be an object.");
                    }
                    $hasText = isset($c['text']) && is_string($c['text']) && trim($c['text']) !== '';
                    $hasImg = isset($c['img']) && is_string($c['img']) && trim($c['img']) !== '';
                    if (! $hasText && ! $hasImg) {
                        abort(422, "mcq choice #$i must have either non-empty text or img.");
                    }
                    if ($hasImg && ! filter_var($c['img'], FILTER_VALIDATE_URL)) {
                        abort(422, "mcq choice #$i img must be a valid URL.");
                    }
                    if ($hasText && mb_strlen(trim($c['text'])) > 200) {
                        abort(422, "mcq choice #$i text is too long (max 200 chars).");
                    }
                }
                if (($validate['mode'] ?? null) !== 'mcq') {
                    abort(422, 'mcq requires validate.mode="mcq".');
                }
                if (! isset($validate['correctIndex']) || ! is_int($validate['correctIndex'])) {
                    abort(422, 'mcq requires validate.correctIndex (integer).');
                }
                $idx = (int) $validate['correctIndex'];
                if ($idx < 0 || $idx >= count($payload['choices'])) {
                    abort(422, 'mcq validate.correctIndex is out of range.');
                }
                break;

            case 'true_false':
                if (($validate['mode'] ?? null) !== 'boolean' || ! array_key_exists('answer', $validate)) {
                    abort(422, 'true_false requires validate.mode="boolean" and validate.answer true/false.');
                }
                break;

            case 'one_word':
                if (($validate['mode'] ?? null) !== 'text'
                    || ! isset($validate['answers']) || ! is_array($validate['answers']) || count($validate['answers']) < 1) {
                    abort(422, 'one_word requires validate.mode="text" with at least one answer.');
                }
                break;

            case 'code_output':
                if (! is_string($payload['code'] ?? null) || trim($payload['code']) === '') {
                    abort(422, 'code_output requires payload.code string.');
                }
                if (($validate['mode'] ?? null) !== 'text'
                    || ! isset($validate['answers']) || ! is_array($validate['answers']) || count($validate['answers']) < 1) {
                    abort(422, 'code_output requires validate.mode="text" with at least one answer.');
                }
                break;

            case 'one_number':
                if (($validate['mode'] ?? null) !== 'numeric' || ! array_key_exists('exact', $validate)) {
                    abort(422, 'one_number requires validate.mode="numeric" and an exact value.');
                }
                if (! is_numeric($validate['exact'])) {
                    abort(422, 'one_number exact must be numeric.');
                }
                if (isset($validate['tolerance']) && ! is_numeric($validate['tolerance'])) {
                    abort(422, 'one_number tolerance must be numeric.');
                }
                break;

            default:
                abort(422, 'Unsupported type.');
        }
    }

    /**
     * Evaluate a user answer. Returns [bool $isCorrect, mixed $normalizedAnswer].
     * - mcq: $normalizedAnswer is the chosen index (int)
     * - true_false: boolean
     * - one_word/code_output: normalized string
     * - one_number: float
     */
    private function evaluate(\App\Models\Short $short, $rawAnswer): array
    {
        $v = $short->validate;

        switch ($short->type) {
            case 'mcq':
                // Answer must be an index
                if (! is_numeric($rawAnswer)) {
                    return [false, $rawAnswer];
                }
                $idx = (int) $rawAnswer;
                $correct = (int) ($v['correctIndex'] ?? -1);

                return [$idx === $correct, $idx];

            case 'true_false':
                // Accept true/false/"true"/"false"/1/0
                $ans = filter_var($rawAnswer, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($ans === null) {
                    return [false, $rawAnswer];
                }

                return [$ans === (bool) $v['answer'], $ans];

            case 'one_word':
            case 'code_output':
                $norm = $this->normText($rawAnswer, $v);
                $answers = array_map(fn ($a) => $this->normText($a, $v), $v['answers'] ?? []);

                return [in_array($norm, $answers, true), $norm];

            case 'one_number':
                if (! is_numeric($rawAnswer)) {
                    return [false, $rawAnswer];
                }
                $num = (float) $rawAnswer;
                $exact = (float) $v['exact'];
                $tol = isset($v['tolerance']) ? (float) $v['tolerance'] : 0.0;
                $ok = abs($num - $exact) <= $tol;

                return [$ok, $num];

        }

        return [false, $rawAnswer];
    }

    /** Normalize short text answers according to validation options. */
    private function normText($value, array $opts): string
    {
        $s = is_string($value) ? $value : (string) $value;
        if (($opts['trim'] ?? true) === true) {
            $s = trim($s);
        }
        if (($opts['caseInsensitive'] ?? true) === true) {
            $s = mb_strtolower($s);
        }
        if (($opts['collapseSpaces'] ?? true) === true) {
            $s = preg_replace('/\s+/u', ' ', $s);
        }

        return $s;
    }
}
