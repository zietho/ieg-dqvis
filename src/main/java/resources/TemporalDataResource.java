package resources;

import com.codahale.metrics.annotation.Timed;
import com.google.common.base.Optional;
import core.TemporalData;
import data.DataDAO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import timeBench.data.TemporalDataset;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import java.util.List;

/**
 * Created by evolution on 10/07/2014.
 */
@Path("/get-data")
@Produces(MediaType.APPLICATION_JSON)
public class TemporalDataResource {
    public TemporalDataset data;
    final Logger logger = LoggerFactory.getLogger(TemporalDataResource.class);
    private DataDAO dataDAO;

    public TemporalDataResource(DataDAO dataDAO){
        this.dataDAO = dataDAO; //set DAO
        this.dataDAO.setAggregatedDataset(this.dataDAO.aggregate()); //pre aggregate
    }

    @GET
    @Timed
    public TemporalData readData(@QueryParam("column") List<String> columns, @QueryParam("granularity") @DefaultValue("hour") String granularity, @QueryParam("from") Optional<String> from, @QueryParam("to") Optional<String> to){
        TemporalData temporalData = new TemporalData();

        if(columns!=null && !columns.isEmpty()) {
            temporalData.add(dataDAO.readAggregated(columns, this.getLevel(granularity)));
            return temporalData;
        }else {
            temporalData.add(dataDAO.readAggregated(this.getLevel(granularity)));
            return temporalData;
        }
    }

    private int getLevel(String granularity){
        switch(granularity){
            case "minute": return 3;
            case "hour": return 2;
            case "day": return 1;
            case "top": return 0;
            default: return 3;
        }
    }


}
