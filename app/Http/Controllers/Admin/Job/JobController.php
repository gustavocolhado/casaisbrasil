<?php

namespace App\Http\Controllers\Admin\Job;

use App\Models\JobListing;
use App\Support\Views\Flash;
use Illuminate\Http\Request;
use App\Enums\Job\JobApproval;
use App\Http\Controllers\Controller;
use App\Actions\JobListing\DeleteJobAction;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $jobs = JobListing::active()->with(['user', 'category'])->paginate(10);

        return view('admin::jobs.index.index', [
            'jobs' => $jobs
        ]);
    }

    public function show(Request $request, int $jobId)
    {
        $jobData = JobListing::active()->with(['user', 'category'])->findOrFail($jobId);

        return view('admin::jobs.show.index', [
            'jobData' => $jobData
        ]);
    }

    public function approve(Request $request, int $jobId)
    {
        $jobData = JobListing::active()->findOrFail($jobId);

        $jobData->update(['approval' => JobApproval::APPROVED]);

        return back()->with('flashMessage', (new Flash(content: __('admin/flash.jobs.approved_success')))->get());
    }

    public function reject(Request $request, int $jobId)
    {
        $jobData = JobListing::active()->findOrFail($jobId);

        $jobData->update(['approval' => JobApproval::REJECTED]);

        return back()->with('flashMessage', (new Flash(content: __('admin/flash.jobs.rejected_success')))->get());
    }

    public function destroy(int $jobId)
    {
        $jobData = JobListing::active()->findOrFail($jobId);

        (new DeleteJobAction($jobData))->execute();

        return redirect()->route('admin.jobs.index')->with('flashMessage', (new Flash(content: __('admin/flash.jobs.deleted_success')))->get());
    }
}
