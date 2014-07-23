package resources;

import com.codahale.metrics.annotation.Timed;
import data.DataDAO;
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
    private core.Schema schema;
    private DataDAO dataDAO;

    public AvailableColumnsResource(DataDAO dataDAO) {
        this.dataDAO = dataDAO;
        this.schema = this.dataDAO.getColumnNames();
    }

    @GET
    @Timed
    public core.Schema getAvailableColumns() {
        return this.schema;
    }

}
