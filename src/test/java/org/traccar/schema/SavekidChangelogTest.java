package org.traccar.schema;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SavekidChangelogTest {

    private static String readFile(String relativePath) throws IOException {
        return Files.readString(Path.of("schema", relativePath), StandardCharsets.UTF_8);
    }

    @Test
    public void testSavekidTablesDeclaredInChangelog() throws IOException {
        String master = readFile("changelog-master.xml");
        assertTrue(master.contains("changelog-6.12.0.xml"), "Master changelog should include 6.12.0");
        assertTrue(master.contains("changelog-6.13.0.xml"), "Master changelog should include 6.13.0");

        String health = readFile("changelog-6.12.0.xml");
        assertTrue(health.contains("createTable tableName=\"tc_savekid_health\""),
                "Savekid health table must exist in changelog");
        assertTrue(health.contains("deviceid"), "Health table must include deviceId column");
        assertTrue(health.contains("recordtime"), "Health table must include recordTime column");
        assertTrue(health.contains("heartrate"), "Health table must include heartRate column");
        assertTrue(health.contains("bodytemperature"), "Health table must include bodyTemperature column");
        assertTrue(health.contains("sleepminutes"), "Health table must include sleepMinutes column");
        assertTrue(health.contains("sosactive"), "Health table must include sosActive column");
        assertTrue(health.contains("batterylevel"), "Health table must include batteryLevel column");

        String children = readFile("changelog-6.13.0.xml");
        assertTrue(children.contains("createTable tableName=\"tc_children\""),
                "Children table must exist in changelog");
        assertTrue(children.contains("name\" type=\"VARCHAR(128)\""), "Children table must include name");
        assertTrue(children.contains("lastname"), "Children table must include lastName");
        assertTrue(children.contains("birthdate"), "Children table must include birthDate");
        assertTrue(children.contains("height"), "Children table must include height");
        assertTrue(children.contains("weight"), "Children table must include weight");
        assertTrue(children.contains("conditions"), "Children table must include conditions");
        assertTrue(children.contains("deviceid"), "Children table must include deviceId");
        assertTrue(children.contains("createdat"), "Children table must include createdAt");
        assertTrue(children.contains("updatedat"), "Children table must include updatedAt");
    }
}
