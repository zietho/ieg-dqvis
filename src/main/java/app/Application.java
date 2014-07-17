package app;

import data.CsvDAO;
import data.DataDAO;
import io.dropwizard.Configuration;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import resources.AvailableColumnsResource;
import org.eclipse.jetty.servlets.CrossOriginFilter;
import resources.TemporalDataResource;

import javax.servlet.DispatcherType;
import java.util.EnumSet;

public class Application extends io.dropwizard.Application<ApplicationConfiguration> {
    public static void main(String[] args) throws Exception {
        new Application().run(args);
    }
    private DataDAO dataDAO;


    @Override
    public String getName() {
        return "hello-world";
    }

    @Override
    public void initialize(Bootstrap bootstrap) {
        //set paths for data and initialize a DAO object for retrieving data
        final String data = "src/main/resources/data/01_raw_data_set1_preprocessed_markus.csv";
        final String spec = "src/main/resources/data/spec2.xml";
        this.dataDAO = new CsvDAO(data,spec); //init implementation of dataDAO
    }

    @Override
    public void run(ApplicationConfiguration configuration, Environment environment) throws Exception {
        final TemporalDataResource temporalDataResource = new TemporalDataResource(dataDAO);
        final AvailableColumnsResource availableColumnsResource = new AvailableColumnsResource(dataDAO);

        environment.jersey().register(temporalDataResource);
        environment.jersey().register(availableColumnsResource);

        environment.servlets().addFilter("CrossOriginFilter", new CrossOriginFilter()).addMappingForUrlPatterns(EnumSet.of(DispatcherType.REQUEST), true, "/*");
        environment.servlets().setInitParameter("allowedOrigins", "*");
        environment.servlets().setInitParameter("allowedHeaders", "X-Requested-With,Content-Type,Accept,Origin,Access-Control-Request-Method,Authorization,Access-Control-Request-Method");
        environment.servlets().setInitParameter("allowedMethods", "OPTIONS,GET,PUT,POST,DELETE,HEAD");
    }

}

