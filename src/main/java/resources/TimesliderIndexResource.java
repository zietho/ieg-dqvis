package resources;

import com.codahale.metrics.annotation.Timed;
import com.google.common.base.Optional;
import core.TemporalData;
import data.DataDAO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import timeBench.data.TemporalDataset;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;


/**
 * Created by evolution on 10/07/2014.
 */
@Path("/get-timeslider-indices")
@Produces(MediaType.APPLICATION_JSON)
public class TimesliderIndexResource {
    final Logger logger = LoggerFactory.getLogger(TemporalDataResource.class);
    private DataDAO dataDAO;

    public TimesliderIndexResource(DataDAO dataDAO){
        this.dataDAO = dataDAO;
    }


}
