<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LocalizeMedia extends Command
{
    protected $signature = 'media:localize
                            {--dry-run : Only list what would be downloaded}
                            {--only= : Comma-separated subset: blog,sliders,ads,testimonials,brands,categories,sub-categories,super-sub-categories,products,stores}';

    protected $description = 'Download externally-hosted images (Cloudinary/Unsplash/etc.) into local storage and rewrite the DB rows';

    /** target label => [table => [column => storage folder]] */
    private const TARGETS = [
        'blog' => ['blog_posts' => ['cover_image' => 'blog']],
        'sliders' => ['homepage_sliders' => ['image_url' => 'sliders']],
        'ads' => ['advertisements' => ['image' => 'advertisements']],
        'testimonials' => ['testimonials' => ['photo' => 'testimonials']],
        'brands' => ['brands' => ['logo' => 'brands']],
        'categories' => ['categories' => ['image' => 'categories']],
        'sub-categories' => ['sub_categories' => ['image' => 'sub-categories']],
        'super-sub-categories' => ['super_sub_categories' => ['image' => 'super-sub-categories']],
        'products' => ['products' => ['image' => 'products']],
        'stores' => ['vendor_stores' => ['logo' => 'stores', 'banner' => 'stores']],
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $only = array_values(array_filter(array_map('trim', explode(',', (string) $this->option('only')))));

        $targets = self::TARGETS;
        if ($only !== []) {
            $targets = array_intersect_key($targets, array_flip($only));
            if ($targets === []) {
                $this->error('No matching targets. Valid values: '.implode(', ', array_keys(self::TARGETS)));

                return self::FAILURE;
            }
        }

        $appUrl = rtrim((string) config('app.url'), '/');
        $downloaded = 0;
        $failed = 0;

        foreach ($targets as $tables) {
            foreach ($tables as $table => $columns) {
                foreach ($columns as $column => $folder) {
                    $rows = DB::table($table)
                        ->whereNotNull($column)
                        ->where($column, 'like', 'http%')
                        ->get(['id', $column]);

                    foreach ($rows as $row) {
                        $url = (string) $row->{$column};

                        // Safety: already a local URL on this app.
                        if (str_starts_with($url, $appUrl.'/storage/')) {
                            continue;
                        }

                        if ($dryRun) {
                            $this->line("  [dry-run] {$table}.{$column} #{$row->id} <- {$url}");
                            $downloaded++;

                            continue;
                        }

                        $local = $this->download($url, $folder, $table, $row->id);

                        if ($local === null) {
                            $failed++;

                            continue;
                        }

                        DB::table($table)->where('id', $row->id)->update([$column => $local]);
                        $downloaded++;
                    }

                    if ($rows->isNotEmpty()) {
                        $this->info(sprintf('%-30s %d external row(s) found', $table.'.'.$column, $rows->count()));
                    }
                }
            }
        }

        $this->info(sprintf('%s %d image(s), %d failed.', $dryRun ? 'Would migrate' : 'Migrated', $downloaded, $failed));

        return self::SUCCESS;
    }

    /**
     * Download one image and store it under circuit-bazaar/{folder}/ on the
     * local public disk. Returns the public URL, or null on failure.
     */
    private function download(string $url, string $folder, string $table, int $id): ?string
    {
        try {
            $response = Http::timeout(20)->withOptions(['verify' => false])->get($url);
        } catch (\Throwable $e) {
            $this->warn("  x #{$id}: {$e->getMessage()}");

            return null;
        }

        if (! $response->successful()) {
            $this->warn("  x #{$id}: HTTP {$response->status()} for {$url}");

            return null;
        }

        $body = $response->body();
        if ($body === '') {
            $this->warn("  x #{$id}: empty response for {$url}");

            return null;
        }

        $name = sprintf(
            'migrated-%s-%d-%s.%s',
            Str::slug($table),
            $id,
            Str::lower(Str::random(8)),
            $this->extensionFor($url, (string) $response->header('Content-Type'))
        );
        $path = "circuit-bazaar/{$folder}/{$name}";

        if (! Storage::disk('public')->put($path, $body)) {
            $this->warn("  x #{$id}: could not write {$path}");

            return null;
        }

        $this->line("  ok #{$id}: -> {$path}");

        return Storage::disk('public')->url($path);
    }

    private function extensionFor(string $url, string $contentType): string
    {
        $map = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'image/gif' => 'gif',
            'image/svg+xml' => 'svg',
            'image/avif' => 'avif',
        ];

        $type = strtolower(trim(explode(';', $contentType)[0]));
        if (isset($map[$type])) {
            return $map[$type];
        }

        $ext = strtolower((string) pathinfo((string) parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'], true)) {
            return $ext === 'jpeg' ? 'jpg' : $ext;
        }

        return 'jpg';
    }
}
