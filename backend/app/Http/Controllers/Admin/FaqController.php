<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index()
    {
        $faqs = Faq::orderByDesc('display_order')->orderByDesc('id')->get(['id', 'question', 'answer', 'display_order', 'is_active', 'created_at', 'updated_at']);
        return response()->json(['faqs' => $faqs]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string'],
            'display_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $faq = Faq::create($validated);

        return response()->json(['message' => 'FAQ created.', 'faq' => $faq], 201);
    }

    public function show(Faq $faq)
    {
        return response()->json(['faq' => $faq]);
    }

    public function update(Request $request, Faq $faq)
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string'],
            'display_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $faq->update($validated);

        return response()->json(['message' => 'FAQ updated.', 'faq' => $faq]);
    }

    public function destroy(Faq $faq)
    {
        $faq->delete();

        return response()->json(['message' => 'FAQ deleted.']);
    }
}
