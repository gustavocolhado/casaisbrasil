<?php

namespace App\Http\Controllers\Admin\Ad;

use App\Models\Ad;
use App\Enums\Ad\AdApproval;
use App\Support\Views\Flash;
use Illuminate\Http\Request;
use App\Actions\Ad\AdDeleteAction;
use App\Http\Controllers\Controller;

class AdController extends Controller
{
    public function index(Request $request)
    {
        $ads = Ad::excludeDraft()->with(['user', 'media'])->latest()->paginate(10);

        return view('admin::ads.index.index', [
            'ads' => $ads
        ]);
    }

    public function show(int $adId)
    {
        $adData = Ad::with(['user', 'media'])->findOrFail($adId);

        return view('admin::ads.show.index', [
            'adData' => $adData
        ]);
    }

    public function destroy(int $adId)
    {
        $adData = Ad::findOrFail($adId);

        (new AdDeleteAction($adData))->execute();

        // TODO: Consider refunding the budget to the user, if the ad is fully deleted.
        // Add checkbox to include refunding the budget to the user.

        return redirect()->route('admin.ads.index')->with('flashMessage', (new Flash(content: __('admin/flash.ad.delete_success')))->get());
    }

    public function approve(int $adId)
    {
        $adData = Ad::findOrFail($adId);

        $adData->update([
            'approval' => AdApproval::APPROVED
        ]);

        return back()->with('flashMessage', (new Flash(content: __('admin/flash.ad.approve_success')))->get());
    }

    public function reject(int $adId)
    {
        $adData = Ad::findOrFail($adId);

        $adData->update([
            'approval' => AdApproval::REJECTED
        ]);

        return back()->with('flashMessage', (new Flash(content: __('admin/flash.ad.reject_success')))->get());
    }
}
