<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function store(Request $request)
    {
        $rating = $request->validate([
            'rating' => 'required|integer|min:0|max:5',
            'user_id' => 'required|integer|exists:users,id',
            'classroom_id' => 'required|integer|exists:classrooms,id',
        ]);

        $ratedBy = $request->user()->id;
        $rating['rated_by'] = $ratedBy;

        $request->user()->ratings()->create($rating);

        return back()->with(['success' => true, 'message' => 'Rating submitted successfully!']);
    }
}
