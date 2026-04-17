package dev.mozhno.spi;

/**
 * Controls how many webhook deliveries a project is allowed to make.
 * <p>
 * Open-source edition: unlimited (Long.MAX_VALUE).
 * SaaS edition: quota-based, decremented on each successful dispatch.
 * </p>
 */
public interface WebhookLimitSpi {

    /**
     * Returns the current remaining delivery count for a project.
     *
     * @param projectId the project to query
     * @return number of deliveries remaining (Long.MAX_VALUE = unlimited)
     */
    long getRemaining(int projectId);

    /**
     * Attempts to consume one delivery from the project's quota.
     *
     * @param projectId the project to debit
     * @return true if the delivery is allowed, false if quota is exhausted
     */
    boolean tryConsume(int projectId);
}
