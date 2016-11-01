AEM Project Example
----------------------------------------------
This sets up an local AEM environment. Maven was used to compile AEM packages. Gulp was used to compile and transport JS, CSS files

Setup
=========================
1. The aem folder needs two files: cq-quickstart-6.0.0.jar and license.properties.
2. Add all needed aem-packages in the install/aem-packages folder.
3. Run ``docker run -d --name aem-dre-author -v $(pwd):/var/aem/remote -p 4502:4502 -p 80:80 aem-dre-author`` for the root project directory (where the Dockerfile is) This takes a while. This will set up the docker images to create the container to run the AEM instance. Note that ports 4502 (for AEM) and 80 (for web) will be watched.

To enter docker environment
=========================
1. Run ``docker exec -it aem-dre-author bash``.
2. From within the environment, there is a good chance the https service is down so run ``service httpd start``
3. If you need to build a package, you can cd to the directory within the project folder and run ``mvn clean install -Plocal-author``
4. Gulp should be installed so you can run gulp commands from within the root of the docker environment (where the gulpfile is). Also, AEM service should be running.

SVN outside the docker environment
=========================
1. SVN is part of MacOS, so you can svn what version of the DRE you are working on.

Login
=========================
1. Once AEM is up, you can go to url ``http://localhost:4502`` and login using username/password "admin".

2. If all AEM packages are installed right, you can view pages as ``http://localhost`` with no port number in the url, as it port-forwarding from 80 to 4502.
