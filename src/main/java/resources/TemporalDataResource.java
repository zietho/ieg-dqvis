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
    public TemporalData readData(@QueryParam("column") Optional<String> column, @QueryParam("granularity") Optional<String> granularity, @QueryParam("from") Optional<String> from, @QueryParam("to") Optional<String> to){
        TemporalData temporalData = new TemporalData();

        if(column.isPresent()) {
            if(granularity.isPresent()) {
                temporalData.add(dataDAO.readAggregated(column.get(), this.getLevel(granularity.get())));
                return temporalData;
            }

            temporalData.add(dataDAO.read(column.or("h")));
            return temporalData;
        }else{
            if(granularity.isPresent()) {
                temporalData.add(dataDAO.readAggregated(this.getLevel(granularity.get())));
                return temporalData;
            }

            temporalData.add(dataDAO.readAggregated(3));
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
