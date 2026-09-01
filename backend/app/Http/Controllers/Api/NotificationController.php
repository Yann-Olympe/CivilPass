<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $agent = $request->user();

        $query = Notification::where('mairie_id', $agent->mairie_id)
            ->with('demande')
            ->latest();

        if ($request->has('lue')) {
            $query->where('lue', (bool) $request->boolean('lue'));
        }

        return response()->json($query->get());
    }

    public function marquerLue(Request $request, Notification $notification)
    {
        abort_unless($notification->mairie_id === $request->user()->mairie_id, 403);

        $notification->update(['lue' => true]);

        return response()->json($notification);
    }
}
