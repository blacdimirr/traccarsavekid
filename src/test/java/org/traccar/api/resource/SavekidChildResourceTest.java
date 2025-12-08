package org.traccar.api.resource;

import jakarta.ws.rs.POST;
import org.junit.jupiter.api.Test;
import org.traccar.model.SavekidChild;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class SavekidChildResourceTest {

    @Test
    public void testAddMethodHasPostAnnotation() throws NoSuchMethodException {
        Method addMethod = SavekidChildResource.class.getMethod("add", SavekidChild.class);
        assertTrue(addMethod.isAnnotationPresent(POST.class), "SavekidChildResource.add must declare @POST");
    }
}
