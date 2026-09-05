<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            VendorUserSeeder::class,
            BlogPostSeeder::class,
            JobPostingSeeder::class,
            TestimonialSeeder::class,
        ]);

        $categories = [
            ['name' => 'Resistors', 'slug' => 'resistors', 'spec_schema' => [
                ['key' => 'resistance', 'label' => 'Resistance', 'type' => 'text'],
                ['key' => 'tolerance', 'label' => 'Tolerance', 'type' => 'select', 'options' => ['±1%', '±5%', '±10%']],
                ['key' => 'power_rating', 'label' => 'Power Rating (W)', 'type' => 'number', 'unit' => 'W'],
            ]],
            ['name' => 'Capacitors', 'slug' => 'capacitors', 'spec_schema' => [
                ['key' => 'capacitance', 'label' => 'Capacitance', 'type' => 'text'],
                ['key' => 'voltage_rating', 'label' => 'Voltage Rating (V)', 'type' => 'number', 'unit' => 'V'],
                ['key' => 'tolerance', 'label' => 'Tolerance', 'type' => 'select', 'options' => ['±5%', '±10%', '±20%']],
                ['key' => 'polarized', 'label' => 'Polarized', 'type' => 'boolean'],
            ]],
            ['name' => 'Microcontrollers', 'slug' => 'microcontrollers', 'spec_schema' => [
                ['key' => 'architecture', 'label' => 'Architecture', 'type' => 'text'],
                ['key' => 'flash_kb', 'label' => 'Flash (KB)', 'type' => 'number', 'unit' => 'KB'],
                ['key' => 'clock_speed', 'label' => 'Clock Speed (MHz)', 'type' => 'number', 'unit' => 'MHz'],
                ['key' => 'supply_voltage', 'label' => 'Supply Voltage (V)', 'type' => 'number', 'unit' => 'V'],
            ]],
            ['name' => 'Sensors', 'slug' => 'sensors', 'spec_schema' => [
                ['key' => 'sensor_type', 'label' => 'Sensor Type', 'type' => 'text'],
                ['key' => 'range', 'label' => 'Range', 'type' => 'text'],
                ['key' => 'interface', 'label' => 'Interface', 'type' => 'select', 'options' => ['Analog', 'I2C', 'SPI', 'UART']],
                ['key' => 'accuracy', 'label' => 'Accuracy', 'type' => 'text'],
            ]],
            ['name' => 'Tools', 'slug' => 'tools', 'spec_schema' => []],
            ['name' => 'Cables & Connectors', 'slug' => 'cables-connectors', 'spec_schema' => []],
        ];
        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => $cat['slug']],
                ['name' => $cat['name'], 'spec_schema' => $cat['spec_schema']]
            );
        }
    }
}
