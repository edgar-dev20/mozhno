package dev.mozhno.spi.impl;

import org.springframework.stereotype.Component;
import dev.mozhno.spi.BillingSpi;

/**
 * Default {@link BillingSpi} implementation for the Community edition that
 * allows all features without restrictions.
 *
 * <p>All feature checks return {@code true} unconditionally. The plan is always
 * reported as {@code "community"} with unlimited members and flags
 * ({@link Integer#MAX_VALUE}). Licensed editions may replace this with a
 * provider that enforces tier-based limits.
 */
@Component
public class CommunityBillingProvider implements BillingSpi {

    /**
     * Checks whether a feature is allowed under the current plan.
     *
     * @param workspaceId the workspace identifier
     * @param featureKey  the feature to check
     * @return always {@code true}
     * @implNote The Community implementation allows all features unconditionally.
     */
    @Override
    public boolean isFeatureAllowed(String workspaceId, String featureKey) {
        return true;
    }

    /**
     * Retrieves the current plan information for the given workspace.
     *
     * @param workspaceId the workspace identifier
     * @return a {@link PlanInfo} with tier {@code "community"} and
     *         unlimited member and flag limits
     * @implNote The Community implementation always returns the community plan
     *           with {@link Integer#MAX_VALUE} for both member and flag limits.
     */
    @Override
    public PlanInfo getPlan(String workspaceId) {
        return new PlanInfo("community", Integer.MAX_VALUE, Integer.MAX_VALUE);
    }
}
