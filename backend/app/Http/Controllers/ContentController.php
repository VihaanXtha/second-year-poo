<?php

namespace App\Http\Controllers;

use App\Models\Advertisement;
use App\Models\BlogPost;
use App\Models\CareerPost;
use App\Models\Category;
use App\Models\CourierInfo;
use App\Models\HomepageSlider;
use App\Models\NewsletterSubscriber;
use App\Models\Product;
use App\Models\SubCategory;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ContentController extends Controller
{
    // =====================
    // BLOG POSTS
    // =====================

    public function blogIndex()
    {
        $posts = BlogPost::orderByDesc('published_at')->get(['id', 'title', 'slug', 'category', 'author', 'cover_image', 'published_at', 'is_published']);

        $cloudinary = new CloudinaryService;
        $posts->transform(function ($post) use ($cloudinary) {
            if ($post->cover_image) {
                $post->cover_image = $cloudinary->deliveryUrl($post->cover_image, 1200);
            }

            return $post;
        });

        return response()->json(['posts' => $posts]);
    }

    public function blogPublishedIndex()
    {
        $posts = BlogPost::where('is_published', true)->orderByDesc('published_at')->get(['id', 'title', 'slug', 'category', 'author', 'cover_image', 'published_at', 'is_published']);

        $cloudinary = new CloudinaryService;
        $posts->transform(function ($post) use ($cloudinary) {
            if ($post->cover_image) {
                $post->cover_image = $cloudinary->deliveryUrl($post->cover_image, 1200);
            }

            return $post;
        });

        return response()->json(['posts' => $posts]);
    }

    public function blogShow($id)
    {
        $post = BlogPost::findOrFail($id);

        if ($post->cover_image) {
            $cloudinary = new CloudinaryService;
            $post->cover_image = $cloudinary->deliveryUrl($post->cover_image, 1200);
        }

        return response()->json($post);
    }

    public function blogShowBySlug($slug)
    {
        $post = BlogPost::where('slug', $slug)->firstOrFail();

        if ($post->cover_image) {
            $cloudinary = new CloudinaryService;
            $post->cover_image = $cloudinary->deliveryUrl($post->cover_image, 1200);
        }

        return response()->json($post);
    }

    public function blogStore(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:blog_posts,slug'],
            'category' => ['required', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'cover_image' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string'],
            'published_at' => ['nullable', 'date'],
            'is_published' => ['boolean'],
        ]);

        $post = BlogPost::create($validated);

        return response()->json(['message' => 'Blog post created.', 'post' => $post], 201);
    }

    public function blogUpdate(Request $request, $id)
    {
        $this->authorizeAdmin();

        $post = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('blog_posts', 'slug')->ignore($post->id)],
            'category' => ['required', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'cover_image' => ['nullable', 'string', 'max:500'],
            'body' => ['nullable', 'string'],
            'published_at' => ['nullable', 'date'],
            'is_published' => ['boolean'],
        ]);

        $post->update($validated);

        return response()->json(['message' => 'Blog post updated.', 'post' => $post]);
    }

    public function blogDestroy($id)
    {
        $this->authorizeAdmin();

        $post = BlogPost::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Blog post deleted.']);
    }

    // =====================
    // CAREER POSTS
    // =====================

    public function careerIndex()
    {
        $posts = CareerPost::orderByDesc('created_at')->get(['id', 'title', 'slug', 'description', 'requirements', 'is_published']);

        return response()->json(['posts' => $posts]);
    }

    public function careerShow($id)
    {
        $post = CareerPost::findOrFail($id);

        return response()->json($post);
    }

    public function careerStore(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:career_posts,slug'],
            'description' => ['required', 'string'],
            'requirements' => ['nullable', 'array'],
            'is_published' => ['boolean'],
        ]);

        $post = CareerPost::create($validated);

        return response()->json(['message' => 'Career post created.', 'post' => $post], 201);
    }

    public function careerUpdate(Request $request, $id)
    {
        $this->authorizeAdmin();

        $post = CareerPost::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('career_posts', 'slug')->ignore($post->id)],
            'description' => ['required', 'string'],
            'requirements' => ['nullable', 'array'],
            'is_published' => ['boolean'],
        ]);

        $post->update($validated);

        return response()->json(['message' => 'Career post updated.', 'post' => $post]);
    }

    public function careerDestroy($id)
    {
        $this->authorizeAdmin();

        $post = CareerPost::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Career post deleted.']);
    }

    // =====================
    // COURIER INFO
    // =====================

    public function courierShow()
    {
        $info = CourierInfo::first();

        return response()->json(['courier' => $info]);
    }

    public function courierStore(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'delivery_zones' => ['nullable', 'array'],
        ]);

        $info = CourierInfo::create($validated);

        return response()->json(['message' => 'Courier info created.', 'courier' => $info], 201);
    }

    public function courierUpdate(Request $request, $id)
    {
        $this->authorizeAdmin();

        $info = CourierInfo::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'delivery_zones' => ['nullable', 'array'],
        ]);

        $info->update($validated);

        return response()->json(['message' => 'Courier info updated.', 'courier' => $info]);
    }

    // =====================
    // HOMEPAGE SLIDERS
    // =====================

    public function slidersIndex()
    {
        $sliders = HomepageSlider::orderBy('sort_order')->get(['id', 'title', 'subtitle', 'image_url', 'headline', 'link_url', 'sort_order', 'is_active']);

        return response()->json(['sliders' => $sliders]);
    }

    public function activeSliders()
    {
        $sliders = HomepageSlider::where('is_active', true)->orderBy('sort_order')->get(['id', 'title', 'subtitle', 'image_url', 'headline', 'link_url', 'sort_order', 'is_active']);

        return response()->json(['sliders' => $sliders]);
    }

    public function sliderStore(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'image_url' => ['required', 'string', 'max:500'],
            'headline' => ['required', 'string', 'max:255'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $slider = HomepageSlider::create($validated);

        return response()->json(['message' => 'Slider created.', 'slider' => $slider], 201);
    }

    public function sliderUpdate(Request $request, $id)
    {
        $this->authorizeAdmin();

        $slider = HomepageSlider::findOrFail($id);

        $validated = $request->validate([
            'image_url' => ['required', 'string', 'max:500'],
            'headline' => ['required', 'string', 'max:255'],
            'link_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $slider->update($validated);

        return response()->json(['message' => 'Slider updated.', 'slider' => $slider]);
    }

    public function sliderDestroy($id)
    {
        $this->authorizeAdmin();

        $slider = HomepageSlider::findOrFail($id);
        $slider->delete();

        return response()->json(['message' => 'Slider deleted.']);
    }

    // =====================
    // ADVERTISEMENTS
    // =====================

    public function activeAdvertisements()
    {
        $ads = Advertisement::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Advertisement $ad) => $this->presentAdvertisement($ad))
            ->values();

        return response()->json(['advertisements' => $ads]);
    }

    public function advertisementsIndex()
    {
        $this->authorizeAdmin();

        $ads = Advertisement::orderBy('sort_order')->orderBy('id')
            ->get()
            ->map(fn (Advertisement $ad) => $this->presentAdvertisement($ad));

        return response()->json(['advertisements' => $ads]);
    }

    public function advertisementStore(Request $request)
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'image' => ['required', 'string', 'max:500'],
            'link_type' => ['required', 'in:product,category,subcategory,external_url'],
            'link_target_id' => ['nullable', 'integer', 'min:1'],
            'external_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $ad = Advertisement::create($validated);

        return response()->json(['message' => 'Advertisement created.', 'advertisement' => $this->presentAdvertisement($ad)], 201);
    }

    public function advertisementUpdate(Request $request, $id)
    {
        $this->authorizeAdmin();

        $ad = Advertisement::findOrFail($id);

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'image' => ['required', 'string', 'max:500'],
            'link_type' => ['required', 'in:product,category,subcategory,external_url'],
            'link_target_id' => ['nullable', 'integer', 'min:1'],
            'external_url' => ['nullable', 'string', 'max:500'],
            'sort_order' => ['integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $ad->update($validated);

        return response()->json(['message' => 'Advertisement updated.', 'advertisement' => $this->presentAdvertisement($ad)]);
    }

    public function advertisementDestroy($id)
    {
        $this->authorizeAdmin();

        $ad = Advertisement::findOrFail($id);
        $ad->delete();

        return response()->json(['message' => 'Advertisement deleted.']);
    }

    // Resolves a linked taxonomy/product target into the shop's route so the
    // storefront never has to guess how link_type maps to a URL.
    private function presentAdvertisement(Advertisement $ad): array
    {
        $data = $ad->only(['id', 'title', 'image', 'link_type', 'link_target_id', 'external_url', 'sort_order', 'is_active']);
        $data['link_url'] = null;
        $data['link_label'] = null;

        if ($ad->link_type === 'external_url') {
            $data['link_url'] = $ad->external_url;
        } elseif ($ad->link_target_id) {
            $target = match ($ad->link_type) {
                'product' => Product::find($ad->link_target_id),
                'category' => Category::find($ad->link_target_id),
                'subcategory' => SubCategory::find($ad->link_target_id),
                default => null,
            };

            if ($target) {
                $data['link_label'] = $target->name;
                $data['link_url'] = match ($ad->link_type) {
                    'product' => "/product/{$target->id}",
                    'category' => "/category/{$target->slug}",
                    'subcategory' => '/subcategory/' . $target->slug,
                };
            }
        }

        return $data;
    }

    public function uploadImage(Request $request)
    {
        $this->authorizeAdmin();

        $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $cloudinary = new CloudinaryService;
        $url = $cloudinary->upload($request->file('image'), 'circuit-bazaar/blog');

        if (! $url) {
            return response()->json(['message' => 'Upload failed.'], 422);
        }

        return response()->json(['url' => $url]);
    }

    public function courierDestroy($id)
    {
        $this->authorizeAdmin();

        $info = CourierInfo::findOrFail($id);
        $info->delete();

        return response()->json(['message' => 'Courier info deleted.']);
    }

    public function newsletterSubscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        NewsletterSubscriber::firstOrCreate(['email' => $validated['email']]);

        return response()->json(['message' => 'Subscribed successfully.'], 201);
    }

    private function authorizeAdmin(): void
    {
        $user = Auth::user();

        if (! $user || $user->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }
    }
}
