<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class JobPostingController extends Controller
{
    public function __construct(private CloudinaryService $cloudinary) {}

    public function index()
    {
        $postings = JobPosting::orderByDesc('application_deadline')
            ->get(['id', 'title', 'slug', 'department', 'location', 'employment_type', 'description', 'requirements', 'application_deadline', 'is_active']);

        return response()->json(['postings' => $postings]);
    }

    public function show($idOrSlug)
    {
        $posting = JobPosting::where('slug', $idOrSlug)->orWhere('id', $idOrSlug)->firstOrFail();

        return response()->json($posting);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:job_postings,slug'],
            'department' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'employment_type' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'responsibilities' => ['nullable', 'string'],
            'requirements' => ['nullable', 'array'],
            'benefits' => ['nullable', 'array'],
            'application_deadline' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ]);

        $posting = JobPosting::create($validated);

        return response()->json(['message' => 'Job posting created.', 'posting' => $posting], 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeAdmin();

        $posting = JobPosting::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('job_postings', 'slug')->ignore($posting->id)],
            'department' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'employment_type' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'responsibilities' => ['nullable', 'string'],
            'requirements' => ['nullable', 'array'],
            'benefits' => ['nullable', 'array'],
            'application_deadline' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ]);

        $posting->update($validated);

        return response()->json(['message' => 'Job posting updated.', 'posting' => $posting]);
    }

    public function destroy($id)
    {
        $this->authorizeAdmin();

        $posting = JobPosting::findOrFail($id);
        $posting->delete();

        return response()->json(['message' => 'Job posting deleted.']);
    }

    public function apply($id, Request $request)
    {
        $posting = JobPosting::findOrFail($id);

        if (! $posting->is_active) {
            return response()->json(['message' => 'This position is no longer accepting applications.'], 422);
        }

        if ($posting->application_deadline && $posting->application_deadline->isPast()) {
            return response()->json(['message' => 'This position is no longer accepting applications.'], 422);
        }

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'notice_period' => ['nullable', Rule::in(['15_days', '1_month', '2_months', '3_months'])],
            'cv' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
            'cv_base64' => ['nullable', 'string'],
            'cv_filename' => ['nullable', 'string', 'max:255'],
        ]);

        $cvUrl = null;

        if ($request->hasFile('cv')) {
            $file = $request->file('cv');
            $cvUrl = $this->cloudinary->uploadRaw($file, 'circuit-bazaar/cvs');
        } elseif (! empty($validated['cv_base64'])) {
            $base64 = $validated['cv_base64'];
            if (str_contains($base64, ',')) {
                $base64 = explode(',', $base64, 2)[1];
            }
            $binary = base64_decode($base64, true);
            if ($binary === false) {
                return response()->json(['message' => 'Invalid CV data.'], 422);
            }

            $filename = $validated['cv_filename'] ?? 'cv.pdf';
            $path = 'cvs/'.uniqid().'_'.preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);

            Storage::disk('public')->put($path, $binary);
            $cvUrl = Storage::url($path);
        }

        $application = JobApplication::create([
            'job_posting_id' => $posting->id,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'notice_period' => $validated['notice_period'],
            'cv_url' => $cvUrl,
            'submitted_at' => now(),
        ]);

        return response()->json(['message' => 'Application submitted successfully.', 'application' => $application], 201);
    }

    public function applications($id)
    {
        $this->authorizeAdmin();

        $posting = JobPosting::findOrFail($id);
        $applications = JobApplication::where('job_posting_id', $posting->id)
            ->orderByDesc('submitted_at')
            ->get();

        return response()->json(['applications' => $applications]);
    }

    private function authorizeAdmin(): void
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }
    }
}
