package dev.mozhno.segments;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import dev.mozhno.events.DomainEvent;
import dev.mozhno.events.DomainEventPublisher;
import dev.mozhno.spi.QuotaSpi;
import dev.mozhno.exception.NotFoundException;
import dev.mozhno.exception.QuotaExceededException;

import java.util.ArrayList;
import java.util.Collections;
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

    public SegmentService(SegmentRepository segmentRepository, SegmentContextRepository segmentContextRepository,
                          DomainEventPublisher events, QuotaSpi quotaSpi) {
        this.segmentRepository = segmentRepository;
        this.segmentContextRepository = segmentContextRepository;
        this.events = events;
        this.quotaSpi = quotaSpi;
    }

    /**
     * Returns all segments belonging to a project.
     *
     * @param projectId the project ID
     * @return list of segment responses with their context rules
     */
    @Transactional(readOnly = true)
    public List<SegmentResponse> findByProjectId(Integer projectId) {
        List<Segment> segments = segmentRepository.findByProjectId(projectId);
        List<Integer> segmentIds = new ArrayList<>();
        for (Segment s : segments) {
            segmentIds.add(s.getId());
        }
        List<SegmentContextRepository.SegmentContextWithName> allContexts =
            segmentContextRepository.findContextsBySegmentIds(segmentIds);
        Map<Integer, List<SegmentResponse.ContextEntryResponse>> contextMap = new java.util.LinkedHashMap<>();
        for (SegmentContextRepository.SegmentContextWithName ctx : allContexts) {
            SegmentResponse.ContextEntryResponse ce = SegmentResponse.ContextEntryResponse.builder()
                .contextDefinitionId(ctx.getContextDefinitionId())
                .operator(ctx.getOperator())
                .contextValues(ctx.getContextValues())
                .build();
            contextMap.computeIfAbsent(ctx.getSegmentId(), k -> new ArrayList<>()).add(ce);
        }

        List<SegmentResponse> responses = new ArrayList<>();
        for (Segment s : segments) {
            responses.add(toResponse(s, contextMap.getOrDefault(s.getId(), Collections.emptyList())));
        }
        return responses;
    }

    /**
     * Finds a segment by its ID and verifies it belongs to the given project.
     *
     * @param id the segment ID
     * @param projectId the project ID to verify ownership
     * @return the segment response with context rules
     * @throws RuntimeException if the segment is not found or belongs to another project
     */
    @Transactional(readOnly = true)
    public SegmentResponse findById(Integer id, Integer projectId) {
        Segment segment;
        if (projectId != null) {
            segment = segmentRepository.findByIdAndProjectId(id, projectId);
        } else {
            segment = segmentRepository.findById(id);
        }
        if (segment == null) throw new NotFoundException("Segment", id);
        List<SegmentContext> contexts = segmentContextRepository.findBySegmentId(segment.getId());
        List<SegmentResponse.ContextEntryResponse> contextResps = new ArrayList<>();
        for (SegmentContext ctx : contexts) {
            SegmentResponse.ContextEntryResponse ce = SegmentResponse.ContextEntryResponse.builder()
                .contextDefinitionId(ctx.getContextDefinitionId())
                .operator(ctx.getOperator())
                .contextValues(ctx.getContextValues())
                .build();
            contextResps.add(ce);
        }
        return toResponse(segment, contextResps);
    }

    @Transactional(readOnly = true)
    public SegmentResponse findById(Integer id) {
        return findById(id, null);
    }

    /**
     * Creates a new segment with its context targeting rules.
     *
     * @param request the segment creation request
     * @return the created segment response
     * @throws RuntimeException if the segment quota is exceeded
     */
    @Transactional
    public SegmentResponse create(SegmentRequest request) {
        QuotaSpi.QuotaResult quota = quotaSpi.canCreateSegment(request.getProjectId());
        if (quota instanceof QuotaSpi.Blocked blocked) {
            throw new QuotaExceededException(blocked.current(), blocked.limit(), blocked.planName());
        }

        Segment segment = new Segment();
        segment.setProjectId(request.getProjectId());
        segment.setName(request.getName());
        segment.setDescription(request.getDescription());
        if (request.getIcon() != null) segment.setIcon(request.getIcon());
        if (request.getColor() != null) segment.setColor(request.getColor());
        Segment saved = segmentRepository.save(segment);

        if (request.getContext() != null) {
            for (SegmentRequest.ContextEntry entry : request.getContext()) {
                SegmentContext ctx = new SegmentContext();
                ctx.setSegmentId(saved.getId());
                ctx.setContextDefinitionId(entry.getContextDefinitionId());
                ctx.setOperator(entry.getOperator() != null ? entry.getOperator() : "in");
                ctx.setContextValues(entry.getContextValues());
                segmentContextRepository.save(ctx);
            }
        }

        events.publish(DomainEvent.of(saved.getProjectId(), "segment.created", "segment",
            saved.getId(), saved.getName(), "Segment created"));
        return toResponse(saved, toContextEntries(saved.getId()));
    }

    /**
     * Updates a segment and replaces its context targeting rules.
     *
     * @param id the segment ID
     * @param request the segment update request
     * @return the updated segment response
     * @throws RuntimeException if the segment is not found
     */
    @Transactional
    public SegmentResponse update(Integer id, SegmentRequest request) {
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
        Segment saved = segmentRepository.save(segment);

        segmentContextRepository.deleteBySegmentId(id);
        if (request.getContext() != null) {
            for (SegmentRequest.ContextEntry entry : request.getContext()) {
                SegmentContext ctx = new SegmentContext();
                ctx.setSegmentId(id);
                ctx.setContextDefinitionId(entry.getContextDefinitionId());
                ctx.setOperator(entry.getOperator() != null ? entry.getOperator() : "in");
                ctx.setContextValues(entry.getContextValues());
                segmentContextRepository.save(ctx);
            }
        }

        events.publish(DomainEvent.of(saved.getProjectId(), "segment.updated", "segment",
            saved.getId(), saved.getName(), "Segment updated"));
        return toResponse(saved, toContextEntries(saved.getId()));
    }

    /**
     * Deletes a segment by its ID.
     *
     * @param id the segment ID
     */
    @Transactional
    public void delete(Integer id, Integer projectId) {
        segmentContextRepository.deleteBySegmentId(id);
        int deleted = segmentRepository.deleteById(id, projectId);
        if (deleted == 0) throw new NotFoundException("Segment", id);
        events.publish(DomainEvent.of(projectId, "segment.deleted", "segment",
            id, null, "Segment deleted"));
    }

    @Transactional
    public void delete(Integer id) {
        delete(id, null);
    }

    private List<SegmentResponse.ContextEntryResponse> toContextEntries(Integer segmentId) {
        List<SegmentContext> contexts = segmentContextRepository.findBySegmentId(segmentId);
        List<SegmentResponse.ContextEntryResponse> contextResps = new ArrayList<>();
        for (SegmentContext ctx : contexts) {
            SegmentResponse.ContextEntryResponse ce = SegmentResponse.ContextEntryResponse.builder()
                .contextDefinitionId(ctx.getContextDefinitionId())
                .operator(ctx.getOperator())
                .contextValues(ctx.getContextValues())
                .build();
            contextResps.add(ce);
        }
        return contextResps;
    }

    private SegmentResponse toResponse(Segment segment, List<SegmentResponse.ContextEntryResponse> contextEntries) {
        return SegmentResponse.builder()
            .id(segment.getId())
            .projectId(segment.getProjectId())
            .name(segment.getName())
            .description(segment.getDescription())
            .icon(segment.getIcon())
            .color(segment.getColor())
            .createdAt(segment.getCreatedAt())
            .context(contextEntries)
            .build();
    }
}