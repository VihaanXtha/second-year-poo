<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TestimonialController extends Controller
{
    public function index()
    {
        $testimonials = Testimonial::where('is_published', true)
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'role', 'company', 'content', 'photo', 'rating', 'is_published']);

        return response()->json(['testimonials' => $testimonials]);
    }

    public function show($id)
    {
        $testimonial = Testimonial::findOrFail($id);

        return response()->json($testimonial);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'photo' => ['nullable', 'string', 'max:500'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'is_published' => ['boolean'],
        ]);

        $testimonial = Testimonial::create($validated);

        return response()->json(['message' => 'Testimonial created.', 'testimonial' => $testimonial], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeAdmin();

        $testimonial = Testimonial::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'photo' => ['nullable', 'string', 'max:500'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'is_published' => ['boolean'],
        ]);

        $testimonial->update($validated);

        return response()->json(['message' => 'Testimonial updated.', 'testimonial' => $testimonial]);
    }

    public function destroy($id)
    {
        $this->authorizeAdmin();

        $testimonial = Testimonial::findOrFail($id);
        $testimonial->delete();

        return response()->json(['message' => 'Testimonial deleted.']);
    }

    private function authorizeAdmin(): void
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }
    }
}
