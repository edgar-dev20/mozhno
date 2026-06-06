package ru.mozhno.spi;

public interface BillingSpi {

    boolean isFeatureAllowed(String workspaceId, String featureKey);

    PlanInfo getPlan(String workspaceId);

    record PlanInfo(String tier, int memberLimit, int flagLimit) {}
}
