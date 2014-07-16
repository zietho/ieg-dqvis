package resources;

import com.codahale.metrics.annotation.Timed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import timeBench.data.TemporalDataset;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 * Created by evolution on 13/07/2014.
 */
@Path("/get-available-columns")
@Produces(MediaType.APPLICATION_JSON)
public class AvailableColumnsResource {
    Logger logger = LoggerFactory.getLogger(TemporalDataResource.class);
    core.Schema schema = new core.Schema();

    public AvailableColumnsResource(TemporalDataset tmpds) {
        prefuse.data.Schema prefuseSchema = tmpds.getTemporalObjectTable().getSchema();
        //cut off the first 3 columns as they are id... temp something..
        for(int i=3; i<prefuseSchema.getColumnCount(); i++){
            this.schema.addColumn(new core.Column(prefuseSchema.getColumnName(i)));
        }
        logger.info("available columns {}", this.schema.getColumns().toString());
    }

    @GET
    @Timed
    public core.Schema getAvailableColumns() {
        return this.schema;
    }

}
