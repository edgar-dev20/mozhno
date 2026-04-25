package ru.mozhno.environments;

import java.time.Instant;

public class Environment {

    private Integer id;
    private String name;
    private Instant createTime;

    public Environment() {}

    public Environment(Integer id, String name, Instant createTime) {
        this.id = id;
        this.name = name;
        this.createTime = createTime;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Instant getCreateTime() { return createTime; }
    public void setCreateTime(Instant createTime) { this.createTime = createTime; }
}