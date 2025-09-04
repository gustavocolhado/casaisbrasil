<?php

namespace App\Http\Controllers\Admin\Market;

use App\Models\Product;
use App\Support\Views\Flash;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Enums\Product\ProductApproval;
use App\Actions\Product\DeleteProductAction;

class MarketController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::active()->with(['user', 'category'])->paginate(10);

        return view('admin::market.index.index', [
            'products' => $products
        ]);
    }

    public function show(int $productId)
    {
        $productData = Product::active()->with(['user', 'category'])->findOrFail($productId);

        return view('admin::market.show.index', [
            'productData' => $productData
        ]);
    }

    public function destroy(int $productId)
    {
        $productData = Product::active()->findOrFail($productId);

        (new DeleteProductAction($productData))->execute();

        return redirect()->route('admin.market.index')
            ->with('flashMessage', (new Flash(content: __('admin/flash.product.delete_success')))->get());
    }

    public function approve(int $productId)
    {
        $productData = Product::active()->findOrFail($productId);

        $productData->update(['approval' => ProductApproval::APPROVED]);

        return redirect()->route('admin.market.show', $productId)
            ->with('flashMessage', (new Flash(content: __('admin/flash.product.approve_success')))->get());
    }

    public function reject(int $productId)
    {
        $productData = Product::active()->findOrFail($productId);

        $productData->update(['approval' => ProductApproval::REJECTED]);

        return redirect()->route('admin.market.show', $productId)
            ->with('flashMessage', (new Flash(content: __('admin/flash.product.reject_success')))->get());
    }
}
