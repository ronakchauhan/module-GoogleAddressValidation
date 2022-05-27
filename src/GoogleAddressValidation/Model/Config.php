<?php
/**
 * @category  Y1
 * @package   Y1_GoogleAddressValidation
 * @copyright Copyright (c) Y1 Digital AG (https://y1.de)
 * @contact   ronak.chauhan@y1.de
 */

namespace Y1\GoogleAddressValidation\Model;

use Magento\Framework\App\Config\ScopeConfigInterface;
use Magento\Store\Api\Data\StoreInterface;
use Magento\Store\Model\ScopeInterface;

class Config
{
    private ScopeConfigInterface $config;

    public function __construct(ScopeConfigInterface $config)
    {
        $this->config = $config;
    }

    /**
     * @param \Magento\Store\Api\Data\StoreInterface|null $store
     *
     * @return string
     */
    public function getApiKey(?StoreInterface $store = null): string
    {
        return $this->config->getValue(
            'y1/google_address_validation/api_key',
            ScopeInterface::SCOPE_STORE,
            $store ? $store->getCode() : null
        );
    }
}
