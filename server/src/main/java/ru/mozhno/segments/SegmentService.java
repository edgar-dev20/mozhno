package ru.mozhno.segments;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SegmentService {
    private final SegmentRepository segmentRepository;
    private final SegmentContextRepository segmentContextRepository;

    public SegmentService(SegmentRepository segmentRepository, SegmentContextRepository segmentContextRepository) {
        this.segmentRepository = segmentRepository;
        this.segmentContextRepository = segmentContextRepository;
    }

    @Transactional(readOnly = true)
    public List<SegmentResponse> findByProjectId(Integer projectId) {
        List<Segment> segments = segmentRepository.findByProjectId(projectId);
        List<SegmentResponse> responses = new ArrayList<>();
        for (Segment s : segments) {
            responses.add(toResponse(s));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public SegmentResponse findById(Integer id) {
        Segment segment = segmentRepository.findById(id);
        if (segment == null) throw new RuntimeException("Segment not found: " + id);
        return toResponse(segment);
    }

    @Transactional
    public SegmentResponse create(SegmentRequest request) {
        Segment segment = new Segment();
        segment.setProjectId(request.getProjectId());
        segment.setName(request.getName());
        segment.setDescription(request.getDescription());
        Segment saved = segmentRepository.save(segment);

        if (request.getContext() != null) {
            for (SegmentRequest.ContextEntry entry : request.getContext()) {
                SegmentContext ctx = new SegmentContext();
                ctx.setSegmentId(saved.getId());
                ctx.setContextDefinitionId(entry.getContextDefinitionId());
                ctx.setContextValues(entry.getContextValues());
                segmentContextRepository.save(ctx);
            }
        }

        return toResponse(saved);
    }

    @Transactional
    public SegmentResponse update(Integer id, SegmentRequest request) {
        Segment segment = segmentRepository.findById(id);
        if (segment == null) throw new RuntimeException("Segment not found: " + id);
        segment.setName(request.getName());
        segment.setDescription(request.getDescription());
        Segment saved = segmentRepository.save(segment);

        segmentContextRepository.deleteBySegmentId(id);
        if (request.getContext() != null) {
            for (SegmentRequest.ContextEntry entry : request.getContext()) {
                SegmentContext ctx = new SegmentContext();
                ctx.setSegmentId(id);
                ctx.setContextDefinitionId(entry.getContextDefinitionId());
                ctx.setContextValues(entry.getContextValues());
                segmentContextRepository.save(ctx);
            }
        }

        return toResponse(saved);
    }

    @Transactional
    public void delete(Integer id) {
        segmentRepository.deleteById(id);
    }

    private SegmentResponse toResponse(Segment segment) {
        SegmentResponse resp = new SegmentResponse();
        resp.setId(segment.getId());
        resp.setProjectId(segment.getProjectId());
        resp.setName(segment.getName());
        resp.setDescription(segment.getDescription());
        resp.setCreatedAt(segment.getCreatedAt());

        List<SegmentContext> contexts = segmentContextRepository.findBySegmentId(segment.getId());
        List<SegmentResponse.ContextEntryResponse> contextResps = new ArrayList<>();
        for (SegmentContext ctx : contexts) {
            SegmentResponse.ContextEntryResponse ce = new SegmentResponse.ContextEntryResponse();
            ce.setContextDefinitionId(ctx.getContextDefinitionId());
            ce.setContextValues(ctx.getContextValues());
            contextResps.add(ce);
        }
        resp.setContext(contextResps);

        return resp;
    }
}