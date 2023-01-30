# Remote Science Frontend

This project is a react application implementing the front end of Remote Science project in IoT.
The build is deployed to S3 service in amazon, which is used as a static host for the page.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!


### `npm run deploy`

This command will deploy the production build to S3 service.\
**Note: you need to have amazon cli interface installed for this command, connected to an IAM user with access to S3 services**
