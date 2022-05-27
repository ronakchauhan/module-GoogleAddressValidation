<?php
/**
 * @category Y1
 * @package Y1\GoogleAddressValidation\ViewModel
 * @copyright Copyright (c) Y1 AG (http://www.y1.de)
 * @contact ronak.chauhano@y1.de
 */

namespace Y1\GoogleAddressValidation\ViewModel;

use Magento\Customer\Api\AddressRepositoryInterface;
use Magento\Customer\Api\Data\AddressInterface;
use Magento\Framework\App\RequestInterface;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Magento\Framework\Webapi\ServiceOutputProcessor;

class CustomerAddressEdit implements ArgumentInterface
{
    private AddressRepositoryInterface $addressRepository;

    private RequestInterface $request;

    private ServiceOutputProcessor $outputProcessor;

    public function __construct(
        AddressRepositoryInterface $addressRepository,
        RequestInterface $request,
        ServiceOutputProcessor $outputProcessor
    )
    {
        $this->addressRepository = $addressRepository;
        $this->request = $request;
        $this->outputProcessor = $outputProcessor;
    }

    /**
     * @return array
     */
    public function getCustomerAddress(): array
    {
        try {
            if ($this->request->getFullActionName() === 'customer_address_form' && $id = $this->request->getParam('id')) {
                $address = $this->addressRepository->getById($id);
                return $this->outputProcessor->convertValue($address, AddressInterface::class);
            }
            return [];
        } catch (\Exception $e) {
            return [];
        }
    }
}
