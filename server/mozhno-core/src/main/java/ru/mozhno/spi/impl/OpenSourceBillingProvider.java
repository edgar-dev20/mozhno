package ru.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import ru.mozhno.spi.BillingSpi;

@Component
public class OpenSourceBillingProvider implements BillingSpi {

    @Override
    public boolean isFeatureAllowed(String workspaceId, String featureKey) {
        return true;
    }

    @Override
    public PlanInfo getPlan(String workspaceId) {
        return new PlanInfo("open-source", Integer.MAX_VALUE, Integer.MAX_VALUE);
    }
}
