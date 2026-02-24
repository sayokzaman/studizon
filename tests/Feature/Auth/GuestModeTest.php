<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuestModeTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_mode_can_be_started_from_login_screen()
    {
        $response = $this->post(route('guest.login'));

        $this->assertAuthenticated();
        $this->assertTrue((bool) session()->get('guest_mode', false));
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_guest_mode_is_read_only_for_mutating_requests()
    {
        $this->post(route('guest.login'));

        $response = $this->post(route('notes.store'), [
            'course_id' => 999999,
            'description' => 'Should not be written in guest mode',
        ]);

        $response->assertSessionHas('message', 'Guest mode is read-only. Sign up to make changes.');
    }
}
