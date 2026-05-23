package ru.mozhno.flags.strategy;

import jakarta.persistence.*;
import ru.mozhno.flags.Flag;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.Instant;

@Entity
@Table(name = "flag_strategies")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "strategy_type", discriminatorType = DiscriminatorType.STRING)
public abstract class FlagStrategy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flag_id", nullable = false)
    @JsonIgnore
    private Flag flag;

    @Column(name = "environment_id", nullable = false)
    private Integer environmentId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private boolean enabled;

    @Transient
    public abstract String getStrategyType();

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Flag getFlag() { return flag; }
    public void setFlag(Flag flag) { this.flag = flag; }
    public Integer getEnvironmentId() { return environmentId; }
    public void setEnvironmentId(Integer environmentId) { this.environmentId = environmentId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
}