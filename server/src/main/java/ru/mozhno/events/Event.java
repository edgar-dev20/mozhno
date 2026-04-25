package ru.mozhno.events;

import java.time.Instant;

public class Event {

    private Integer id;
    private Instant createdAt;
    private String type;
    private String createdBy;
    private String data;

    public Event() {}

    public Event(Integer id, Instant createdAt, String type, String createdBy, String data) {
        this.id = id;
        this.createdAt = createdAt;
        this.type = type;
        this.createdBy = createdBy;
        this.data = data;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
}