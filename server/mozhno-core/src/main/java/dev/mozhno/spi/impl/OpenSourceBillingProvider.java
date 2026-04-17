package dev.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import dev.mozhno.spi.BillingSpi;

/**
 * Default {@link BillingSpi} implementation for the open-source edition that
 * allows all features without restrictions.
 *
 * <p>All feature checks return {@code true} unconditionally. The plan is always
 * reported as {@code "open-source"} with unlimited members and flags
 * ({@link Integer#MAX_VALUE}). Licensed editions may replace this with a
 * provider that enforces tier-based limits.
 */
@Component
public class OpenSourceBillingProvider implements BillingSpi {

    /**
     * Checks whether a feature is allowed under the current plan.
     *
     * @param workspaceId the workspace identifier
     * @param featureKey  the feature to check
     * @return always {@code true}
     * @implNote The OSS implementation allows all features unconditionally.
     */
    @Override
    public boolean isFeatureAllowed(String workspaceId, String featureKey) {
        return true;
    }

    /**
     * Retrieves the current plan information for the given workspace.
     *
     * @param workspaceId the workspace identifier
     * @return a {@link PlanInfo} with tier {@code "open-source"} and
     *         unlimited member and flag limits
     * @implNote The OSS implementation always returns the open-source plan
     *           with {@link Integer#MAX_VALUE} for both member and flag limits.
     */
    @Override
    public PlanInfo getPlan(String workspaceId) {
        return new PlanInfo("open-source", Integer.MAX_VALUE, Integer.MAX_VALUE);
    }
}
