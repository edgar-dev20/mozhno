package dev.mozhno.segments;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.spi.QuotaSpi;
import dev.mozhno.Operator;
import dev.mozhno.exception.BadRequestException;
import dev.mozhno.exception.NotFoundException;
import dev.mozhno.contexts.ContextService;
import dev.mozhno.util.QuotaValidator;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for managing user segments, including their context-based targeting rules.
 * Enforces quota limits on segment creation.
 */
@Service
public class SegmentService {
    private final SegmentRepository segmentRepository;
    private final SegmentContextRepository segmentContextRepository;
    private final DomainEventPublisher events;
    private final QuotaSpi quotaSpi;
    private final ContextService contextService;

    public SegmentService(SegmentRepository segmentRepository, SegmentContextRepository segmentContextRepository,
                          DomainEventPublisher events, QuotaSpi quotaSpi, ContextService contextService) {
        this.segmentRepository = segmentRepository;
        this.segmentContextRepository = segmentContextRepository;
        this.events = events;
        this.quotaSpi = quotaSpi;
        this.contextService = contextService;
    }

    /**
     * Returns all segments belonging to a project.
     *
     * @param projectId the project ID
     * @return list of segment responses with their context rules
     */
    @Transactional(readOnly = true)
    public List<Segment> findByProjectId(Integer projectId) {
        return segmentRepository.findByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public Segment findById(Integer id, Integer projectId) {
        Segment segment;
        if (projectId != null) {
            segment = segmentRepository.findByIdAndProjectId(id, projectId);
        } else {
            segment = segmentRepository.findById(id);
        }
        if (segment == null) throw new NotFoundException("Segment", id);
        return segment;
    }

    @Transactional
    public Segment create(SegmentRequest request) {
        QuotaValidator.check(quotaSpi.canCreateSegment(request.getProjectId()));

        validateContextValues(request);

        Segment segment = new Segment();
        segment.setProjectId(request.getProjectId());
        segment.setName(request.getName());
        segment.setDescription(request.getDescription());
        if (request.getIcon() != null) segment.setIcon(request.getIcon());
        if (request.getColor() != null) segment.setColor(request.getColor());
        Segment saved = segmentRepository.save(segment);

        if (request.getContext() != null && !request.getContext().isEmpty()) {
            segmentContextRepository.saveBatch(saved.getId(), request.getContext());
        }

        events.publish(DomainEvent.of(saved.getProjectId(), "segment.created", "segment",
            saved.getId(), saved.getName(), "Segment created"));
        return saved;
    }

    @Transactional
    public Segment update(Integer id, SegmentRequest request) {
        Segment segment;
        if (request.getProjectId() != null) {
            segment = segmentRepository.findByIdAndProjectId(id, request.getProjectId());
        } else {
            segment = segmentRepository.findById(id);
        }
        if (segment == null) throw new NotFoundException("Segment", id);
        segment.setName(request.getName());
        segment.setDescription(request.getDescription());
        if (request.getIcon() != null) segment.setIcon(request.getIcon());
        if (request.getColor() != null) segment.setColor(request.getColor());

        validateContextValues(request);

        Segment saved = segmentRepository.save(segment);

        segmentContextRepository.deleteBySegmentId(id);
        if (request.getContext() != null && !request.getContext().isEmpty()) {
            segmentContextRepository.saveBatch(id, request.getContext());
        }

        events.publish(DomainEvent.of(saved.getProjectId(), "segment.updated", "segment",
            saved.getId(), saved.getName(), "Segment updated"));
        return saved;
    }

    @Transactional
    public void delete(Integer id, Integer projectId) {
        segmentContextRepository.deleteBySegmentId(id);
        int deleted = segmentRepository.deleteById(id, projectId);
        if (deleted == 0) throw new NotFoundException("Segment", id);
        events.publish(DomainEvent.of(projectId, "segment.deleted", "segment",
            id, null, "Segment deleted"));
    }

    public List<SegmentContext> getContexts(Integer segmentId) {
        return segmentContextRepository.findBySegmentId(segmentId);
    }

    public List<SegmentContextRepository.SegmentContextWithName> getContextsForSegments(List<Integer> segmentIds) {
        return segmentContextRepository.findContextsBySegmentIds(segmentIds);
    }

    private void validateContextValues(SegmentRequest request) {
        if (request.getContext() == null || request.getContext().isEmpty()) return;

        List<SegmentRequest.ContextEntry> entries = request.getContext();
        for (int i = 0; i < entries.size(); i++) {
            SegmentRequest.ContextEntry entry = entries.get(i);
            String label = "Constraint #" + (i + 1);
            String operator = entry.getOperator();
            if (operator == null || operator.isBlank()) {
                throw new BadRequestException(label + ": operator is required");
            }
            String values = entry.getContextValues();
            if (values == null || values.isBlank()) {
                throw new BadRequestException(label + ": values are required");
            }
            if (Operator.isMulti(operator)) continue;
            long nonEmptyCount = Arrays.stream(values.split(","))
                .map(String::trim)
                .filter(v -> !v.isEmpty())
                .count();
            if (nonEmptyCount > 1) {
                throw new BadRequestException(
                    label + ": single-value operator '" + operator +
                    "' cannot have multiple values (got " + nonEmptyCount + ")");
            }
        }

        Map<Integer, String> valuesByDefId = new HashMap<>();
        for (SegmentRequest.ContextEntry entry : request.getContext()) {
            if (entry.getContextValues() != null && !entry.getContextValues().isBlank()) {
                valuesByDefId.merge(entry.getContextDefinitionId(), entry.getContextValues(),
                    (a, b) -> a + ", " + b);
            }
        }
        contextService.validateStrictValues(valuesByDefId);
    }
}