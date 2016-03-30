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
import java.util.ArrayList;
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

    /*
    bassed on the different input queries different dao methods are used to access the data
     */

    @GET
    @Timed
    public TemporalData readData(@QueryParam("column") List<String> columns, @QueryParam("granularity") Optional<String> granularity, @QueryParam("from") Optional<Integer> from, @QueryParam("to") Optional<Integer> to, @QueryParam("load") Optional<String> load, @QueryParam("indicator") List<String> indicators){
        TemporalData temporalData = new TemporalData();

        if(indicators == null || indicators.isEmpty()){
            indicators = new ArrayList<String>();
            indicators.add("$.MissingData");
            indicators.add("$.InvalidData");
            indicators.add("MissingTimeStamp");
        }

        //loading a single column
        if(!columns.isEmpty() && columns.size()==1) {
            logger.info("load single column!");
            if(columns.get(0).equals("all")) {
                if(from.isPresent() && to.isPresent()){
                    int[] range = {from.get(), to.get()};
                    if(granularity.isPresent() && !granularity.equals("auto")) {
                        temporalData.add(dataDAO.readAggregated(this.getLevel(granularity.get()), indicators, range));
                    }else{
                        temporalData.add(dataDAO.readAggregated(getSuitableGranularity(range), indicators, range));
                    }
                }else {
                    if(granularity.isPresent() && !granularity.equals("auto")) {
                        temporalData.add(dataDAO.readAggregated(this.getLevel(granularity.get()), indicators));
                    }else{
                        int[] range = {0,100};
                        temporalData.add(dataDAO.readAggregated(getSuitableGranularity(range), indicators));
                    }
                }

            }else{
                String column = columns.get(0);
                if(from.isPresent() && to.isPresent()){
                    int[] range = {from.get(), to.get()};
                    temporalData.add(dataDAO.readAggregated(column, this.getLevel(granularity.get()), indicators, range));
                }else {
                    temporalData.add(dataDAO.readAggregated(column, this.getLevel(granularity.get()), indicators));
                }
            }
        }
        //loading multiple columns
        else if(!columns.isEmpty() && columns.size()>1){
            //individually
            if(load.isPresent() && load.get().equals("individually")){
                for(String column:columns){
                    if(from.isPresent() && to.isPresent()){
                        int[] range = {from.get(), to.get()};
                        if(!granularity.get().equals("auto")) {
                            logger.info("in indiv + not auto");
                            temporalData.add(dataDAO.readAggregated(column, this.getLevel(granularity.get()), indicators, range));
                        }else{
                            logger.info("in indiv with suitable");

                            int suitableGranularity = this.getSuitableGranularity(range);

                            if(suitableGranularity<=3) {
                                temporalData.add(dataDAO.readAggregated(column, suitableGranularity , indicators, range));
                            }else{
                                temporalData.add(dataDAO.readTimeSlice(column, indicators, range));
                            }
                        }
                    }else {
                        temporalData.add(dataDAO.readAggregated(column, this.getLevel(granularity.get()), indicators));
                    }
                }
            }
            //aggregated
            else{
                if(from.isPresent() && to.isPresent()){
                    int[] range = {from.get(), to.get()};
                    temporalData.add(dataDAO.readAggregated(columns, this.getLevel(granularity.get()), indicators, range));
                }else {
                    temporalData.add(dataDAO.readAggregated(columns, this.getLevel(granularity.get()), indicators));
                }
            }
        }
        //default
        else{
            temporalData.add(dataDAO.readAggregated(this.getLevel(granularity.get())));
        }

        return temporalData;
    }

    //private helper functions

    private int getLevel(String granularity){
        switch(granularity){
            case "minute": return 3;
            case "hour": return 2;
            case "day": return 1;
            case "top": return 0;
            default: return 3;
        }
    }

    public int getSuitableGranularity(int[] range){
        double percentOfData = (double) (range[1]-range[0])/100;
        int expectedDataPoints = 0;
        int desiredGranularity = -1;

        do{
            desiredGranularity++;
            expectedDataPoints = (int) (dataDAO.getDataPointsToGranularity(desiredGranularity)*percentOfData);
            logger.info("expected datapoints for granularity: "+desiredGranularity+ " is "+expectedDataPoints);
            System.out.println("epected datapoints "+desiredGranularity+" is "+ expectedDataPoints);
            if(expectedDataPoints>250)
                desiredGranularity--;
        } while(expectedDataPoints<=250 && desiredGranularity <4);

        return desiredGranularity;
    }
}
