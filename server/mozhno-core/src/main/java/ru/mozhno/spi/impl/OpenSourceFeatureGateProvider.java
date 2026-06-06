package ru.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import ru.mozhno.spi.FeatureGateSpi;

@Component
public class OpenSourceFeatureGateProvider implements FeatureGateSpi {

    @Override
    public boolean isFeatureEnabled(String workspaceId, FeatureKey key) {
        return true;
    }
}
