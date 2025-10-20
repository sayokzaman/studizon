<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\NoteAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use ZipArchive;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Http\Response;

class NoteController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get public notes (for feed) - similar to classrooms available to join
        $notes = Note::with(['attachments', 'author'])
            ->latest()
            ->get()->take(10); // Limit for feed

        // Get user's own notes - similar to "myClasses"
        $myNotes = Note::where('user_id', $user->id)
            ->with('attachments')
            ->latest()
            ->get();

        return inertia('note/index', [
            'notes' => $notes,
            'myNotes' => $myNotes,
        ]);
    }

    public function show(Note $note)
    {
        $user = Auth::user();

        // Optional: Add authorization if notes should be private
        // For now, notes are public like social media posts
        // abort_unless($note->user_id === $user->id, 403);

        return inertia('note/show', [
            'note' => $note->load(['attachments', 'author']),
        ]);
    }

    public function store(Request $request)
    {
        // ✅ 1. Validate incoming data
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'description' => 'required|string|max:1000',
            'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,txt|max:5120', // 5MB
        ]);

        DB::transaction(function () use ($validated, $request, &$note) {
            $user = Auth::user();

            // ✅ 2. Create the note
            $note = Note::create([
                'user_id' => Auth::id(),
                'course_id' => $validated['course_id'],
                'description' => $validated['description'],
            ]);

            // ✅ 3. Store attachments if any were uploaded
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $filePath = $file->store('note_attachments', 'public');
                    NoteAttachment::create([
                        'note_id' => $note->id,
                        'file_path' => $filePath,
                        'file_name' => $file->getClientOriginalName(),
                        'file_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }
        });

        // ✅ 4. Return response
        return redirect()->route('notes.index')->with([
            'success' => true,
            'message' => 'Note created successfully',
            'note' => $note->load('attachments'),
        ]);
    }

    // ...

    public function update(Request $request, Note $note)
    {
        $request->validate([
            'description' => 'required|string',
            'attachments.*' => 'file|max:5120',
        ]);

        $note->update([
            'description' => $request->description,
        ]);

        // Remove selected attachments
        if ($request->has('remove_attachment_ids')) {
            $note->attachments()->whereIn('id', $request->remove_attachment_ids)->delete();
        }

        // Add new attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('notes', 'public');
                $note->attachments()->create([
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'file_type' => $file->getClientMimeType(),
                ]);
            }
        }

        $note->load('attachments', 'author'); // 👈 ensures attachments + author info

        return back()->with('note', $note);
    }

    // ------------------- destroy() -------------------
    public function destroy(Request $request, Note $note)
    {
        // Authorization: only owner can delete
        $user = $request->user();
        abort_unless($note->user_id === $user->id, 403);

        DB::transaction(function () use ($note) {
            // Delete all attachments files and records
            foreach ($note->attachments as $att) {
                if ($att->file_path && Storage::disk('public')->exists($att->file_path)) {
                    Storage::disk('public')->delete($att->file_path);
                }
                $att->delete();
            }

            // delete the note
            $note->delete();
        });

        // For Inertia frontends, you can return json or redirect.
        // Return JSON for immediate client-side handling:
        return redirect()->route('notes.index')->with([
            'success' => true,
            'message' => 'Note deleted successfully',
        ]);
    }

    public function download(Note $note)
    {
        $attachments = $note->attachments;

        if ($attachments->isEmpty()) {
            return back()->with('error', 'No attachments to download.');
        }

        $zipFileName = 'note_' . $note->id . '_attachments.zip';
        $zipPath = storage_path('app/public/' . $zipFileName);

        $zip = new ZipArchive;
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            foreach ($attachments as $att) {
                $filePath = storage_path('app/public/' . $att->file_path);
                if (file_exists($filePath)) {
                    $zip->addFile($filePath, basename($att->file_name));
                }
            }
            $zip->close();
        }

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }

    // public function store(Request $request)
    // {
    //     $validated = $request->validate([
    //         'course_id' => 'required|exists:courses,id',
    //         'description' => 'required|string|max:1000',
    //         'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,txt|max:5120',
    //     ]);

    //     $note = Note::create([
    //         'user_id' => Auth::id(),
    //         'course_id' => $validated['course_id'],
    //         'description' => $validated['description'],
    //     ]);

    //     if ($request->hasFile('attachments')) {
    //         foreach ($request->file('attachments') as $file) {
    //             $note->attachments()->create([
    //                 'file_path' => $file->store('note_attachments'),
    //                 'file_name' => $file->getClientOriginalName(),
    //             ]);
    //         }
    //     }

    //     return response()->json([
    //         'success' => true,
    //         'message' => 'Note created successfully',
    //         'note' => $note->load('attachments'),
    //     ]);
    // }

    // Additional methods you might want for social features:
    public function loadMore(Request $request) // new
    {
        $pageSize = 10;
        $notes = Note::with(['attachments', 'author'])
            ->latest()
            ->paginate($pageSize);

        return response()->json([
            'data' => $notes->items(),
            'current_page' => $notes->currentPage(),
            'last_page' => $notes->lastPage(),
        ]);
    }

    public function like(Request $request, Note $note)
    {
        $user = $request->user();

        // Check if already liked
        if ($note->likes()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->with([
                'message' => 'You have already liked this note.',
                'success' => false,
            ]);
        }

        // Add like
        $note->likes()->attach($user->id);

        return redirect()->route('note.show', $note)->with([
            'message' => 'Note liked!',
            'success' => true,
        ]);
    }

    public function unlike(Request $request, Note $note)
    {
        $user = $request->user();

        // Check if actually liked
        if (!$note->likes()->where('user_id', $user->id)->exists()) {
            return redirect()->back()->with([
                'message' => 'You have not liked this note.',
                'success' => false,
            ]);
        }

        // Remove like
        $note->likes()->detach($user->id);

        return redirect()->route('note.show', $note)->with([
            'message' => 'Note unliked.',
            'success' => true,
        ]);
    }

    public function comment(Request $request, Note $note)
    {
        $user = $request->user();

        $validated = $request->validate([
            'content' => 'required|string|max:500',
        ]);

        // Add comment (assuming you have a Comment model)
        // $comment = $note->comments()->create([
        //     'user_id' => $user->id,
        //     'content' => $validated['content'],
        // ]);

        return redirect()->route('note.show', $note)->with([
            'message' => 'Comment added successfully',
            'success' => true,
        ]);
    }

    // If you want users to be able to delete their notes
    // public function destroy(Note $note)
    // {
    //     $user = Auth::user();

    //     // Prevent unauthorized deletion
    //     abort_unless($note->user_id === $user->id, 403);

    //     $note->delete();

    //     return redirect()->route('note.index')->with([
    //         'message' => 'Note deleted successfully',
    //         'success' => true,
    //     ]);
    // }
}