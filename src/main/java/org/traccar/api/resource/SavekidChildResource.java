/*
 * Copyright 2025 SaveKID
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.traccar.api.resource;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.traccar.api.BaseObjectResource;
import org.traccar.model.Child;
import org.traccar.model.ChildHealth;
import org.traccar.model.Device;
import org.traccar.model.User;
import org.traccar.storage.StorageException;
import org.traccar.storage.query.Columns;
import org.traccar.storage.query.Condition;
import org.traccar.storage.query.Order;
import org.traccar.storage.query.Request;

import java.util.Date;
import java.util.LinkedList;
import java.util.stream.Stream;

@Path("savekid/children")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SavekidChildResource extends BaseObjectResource<Child> {

    public SavekidChildResource() {
        super(Child.class);
    }

    private boolean hasHealthValues(ChildHealth health) {
        return health != null && (health.getHeartRate() != null
                || health.getTemperature() != null
                || health.getSteps() != null
                || health.getSleep() != null);
    }

    private void persistBaseHealth(Child entity, ChildHealth health, Date defaultTimestamp) throws StorageException {
        if (hasHealthValues(health)) {
            health.setChildId(entity.getId());
            if (health.getTimestamp() == null) {
                health.setTimestamp(defaultTimestamp);
            }
            storage.addObject(health, new Request(new Columns.Exclude("id")));
        }
    }

    @GET
    public Stream<Child> get(
            @QueryParam("all") boolean all, @QueryParam("userId") long userId,
            @QueryParam("deviceId") Long deviceId) throws StorageException {

        var conditions = new LinkedList<Condition>();

        if (all) {
            if (permissionsService.notAdmin(getUserId())) {
                conditions.add(new Condition.Permission(User.class, getUserId(), baseClass));
            }
        } else {
            if (userId == 0) {
                conditions.add(new Condition.Permission(User.class, getUserId(), baseClass));
            } else {
                permissionsService.checkUser(getUserId(), userId);
                conditions.add(new Condition.Permission(User.class, userId, baseClass));
            }
        }

        if (deviceId != null && deviceId > 0) {
            permissionsService.checkPermission(Device.class, getUserId(), deviceId);
            conditions.add(new Condition.Equals("deviceId", deviceId));
        }

        return storage.getObjectsStream(baseClass, new Request(new Columns.All(), Condition.merge(conditions), new Order("name")));
    }

    @Path("by-device/{deviceId}")
    @GET
    public Response getByDevice(@PathParam("deviceId") long deviceId) throws StorageException {
        permissionsService.checkPermission(Device.class, getUserId(), deviceId);

        Child child = storage.getObject(baseClass, new Request(
                new Columns.All(),
                new Condition.Equals("deviceId", deviceId),
                new Order("createdAt")));
        if (child == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        permissionsService.checkPermission(baseClass, getUserId(), child.getId());
        return Response.ok(child).build();
    }

    @Override
    @POST
    public Response add(Child entity) throws Exception {
        if (entity.getDeviceId() != null) {
            permissionsService.checkPermission(Device.class, getUserId(), entity.getDeviceId());
        }
        Date now = new Date();
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        ChildHealth health = entity.getBaseHealth();
        entity.setBaseHealth(null);

        Response response = super.add(entity);
        persistBaseHealth(entity, health, now);
        return response;
    }

    @Override
    @PUT
    public Response update(Child entity) throws Exception {
        Child stored = storage.getObject(baseClass, new Request(
                new Columns.All(), new Condition.Equals("id", entity.getId())));
        if (stored == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        if (entity.getDeviceId() != null) {
            permissionsService.checkPermission(Device.class, getUserId(), entity.getDeviceId());
        }

        entity.setCreatedAt(stored.getCreatedAt());
        entity.setUpdatedAt(new Date());

        ChildHealth health = entity.getBaseHealth();
        entity.setBaseHealth(null);

        Response response = super.update(entity);
        persistBaseHealth(entity, health, entity.getUpdatedAt());
        return response;
    }
}
