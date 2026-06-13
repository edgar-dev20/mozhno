package dev.mozhno.spi;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AuditSpiTest {

    @Test
    void auditRecordShouldStoreAllFields() {
        var record = new AuditSpi.AuditRecord(
            1, 42, "John Doe", "john@test.com",
            "CREATE", "FLAG", 100, "new-feature",
            "Flag created via web UI", "192.168.1.1");

        assertThat(record.projectId()).isEqualTo(1);
        assertThat(record.userId()).isEqualTo(42);
        assertThat(record.userName()).isEqualTo("John Doe");
        assertThat(record.userEmail()).isEqualTo("john@test.com");
        assertThat(record.action()).isEqualTo("CREATE");
        assertThat(record.resourceType()).isEqualTo("FLAG");
        assertThat(record.resourceId()).isEqualTo(100);
        assertThat(record.resourceName()).isEqualTo("new-feature");
        assertThat(record.details()).isEqualTo("Flag created via web UI");
        assertThat(record.ipAddress()).isEqualTo("192.168.1.1");
    }

    @Test
    void auditRecordShouldAllowNullFields() {
        var record = new AuditSpi.AuditRecord(
            null, null, null, null,
            "SYSTEM", "SETTINGS", null, null,
            null, null);

        assertThat(record.projectId()).isNull();
        assertThat(record.userId()).isNull();
        assertThat(record.userName()).isNull();
        assertThat(record.userEmail()).isNull();
        assertThat(record.action()).isEqualTo("SYSTEM");
        assertThat(record.details()).isNull();
        assertThat(record.ipAddress()).isNull();
    }

    @Test
    void logShouldBeCalledForEveryRecord() {
        List<AuditSpi.AuditRecord> captured = new ArrayList<>();
        AuditSpi audit = captured::add;

        var record1 = new AuditSpi.AuditRecord(
            1, 1, "User", "u@t.com", "CREATE", "FLAG", 1, "f1", "details", "127.0.0.1");
        var record2 = new AuditSpi.AuditRecord(
            1, 1, "User", "u@t.com", "DELETE", "FLAG", 1, "f1", "details", "127.0.0.1");

        audit.log(record1);
        audit.log(record2);

        assertThat(captured).hasSize(2);
        assertThat(captured.get(0).action()).isEqualTo("CREATE");
        assertThat(captured.get(1).action()).isEqualTo("DELETE");
    }

    @Test
    void auditRecordEqualityShouldWorkWithSameValues() {
        var r1 = new AuditSpi.AuditRecord(1, 2, "A", "a@b.c", "X", "Y", 3, "Z", "d", "ip");
        var r2 = new AuditSpi.AuditRecord(1, 2, "A", "a@b.c", "X", "Y", 3, "Z", "d", "ip");

        assertThat(r1).isEqualTo(r2);
        assertThat(r1.hashCode()).isEqualTo(r2.hashCode());
    }
}
