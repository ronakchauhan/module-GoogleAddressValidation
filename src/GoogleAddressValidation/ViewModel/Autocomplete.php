<?php
/**
 * @category Y1
 * @package Y1\GoogleAddressValidation\ViewModel
 * @copyright Copyright (c) Y1 AG (http://www.y1.de)
 * @contact ronak.chauhan@y1.de
 */

namespace Y1\GoogleAddressValidation\ViewModel;

use Magento\Directory\Model\AllowedCountries;
use Magento\Framework\View\Element\Block\ArgumentInterface;
use Y1\GoogleAddressValidation\Model\Config;

class Autocomplete implements ArgumentInterface
{
    private Config $config;

    private AllowedCountries $allowedCountries;

    public function __construct(Config $config, AllowedCountries $allowedCountries)
    {
        $this->config = $config;
        $this->allowedCountries = $allowedCountries;
    }

    /**
     * @return array
     */
    public function getAllowedCountries(): array
    {
        return array_values($this->allowedCountries->getAllowedCountries());
    }

    /**
     * @return string
     */
    public function getApiKey(): string
    {
        return $this->config->getApiKey();
    }
}
