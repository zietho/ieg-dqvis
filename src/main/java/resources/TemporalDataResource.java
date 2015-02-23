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
        this.dataDAO = dataDAO;
        this.dataDAO.aggregate();
        logger.info("temporal data resource inint");
    }

    @GET
    @Timed
    public TemporalData readData(@QueryParam("column") Optional<String> column, @QueryParam("granularity") Optional<Integer> granularity, @QueryParam("from") Optional<String> from, @QueryParam("to") Optional<String> to){
        logger.info("ressource in");
        logger.debug("hey");
        if(column.isPresent()) {
            logger.info("column: "+column);
            if(granularity.isPresent()){
                logger.info("granularity: "+granularity);

            }

            TemporalData temporalData = new TemporalData();
            temporalData.add(dataDAO.read(column.or("h")));
            return temporalData;
        }else{
            return dataDAO.read();
        }
    }


}
