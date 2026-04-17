package dev.mozhno.common;

import lombok.Getter;
import java.util.List;

@Getter
public class PageResponse<T> {
    private final List<T> items;
    private final int page;
    private final int size;
    private final long totalItems;
    private final int totalPages;

    public PageResponse(List<T> items, int page, int size, long totalItems) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.totalItems = totalItems;
        this.totalPages = size > 0 ? (int) Math.ceil((double) totalItems / size) : 0;
    }
}
