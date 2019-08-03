import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';
import { AppRegistry, StyleSheet, Text, View, Alert } from 'react-native';
import Form from 'react-native-jsonschema-form'
import { createBrowserApp } from '@react-navigation/web'
import { createSwitchNavigator } from '@react-navigation/core'

const schema = {
  schema: {
    title: "A registration form",
    description: "A simple form example.",
    type: "object",
    required: ["firstName", "lastName"],
    properties: {
      firstName: {
        type: "string",
        title: "First name",
        default: "Chuck",
      },
      lastName: {
        type: "string",
        title: "Last name",
      },
      age: {
        type: "integer",
        title: "Age",
      },
      bio: {
        type: "string",
        title: "Bio",
      },
      password: {
        type: "string",
        title: "Password",
        minLength: 3,
      },
      telephone: {
        type: "string",
        title: "Telephone",
        minLength: 10,
      },
    },
  },
  uiSchema: {
    firstName: {
      "ui:autofocus": true,
      "ui:emptyValue": "",
    },
    age: {
      "ui:widget": "updown",
      "ui:title": "Age of person",
      "ui:description": "(earthian year)",
    },
    bio: {
      "ui:widget": "textarea",
    },
    password: {
      "ui:widget": "password",
      "ui:help": "Hint: Make it strong!",
    },
    date: {
      "ui:widget": "alt-datetime",
    },
    telephone: {
      "ui:options": {
        inputType: "tel",
      },
    },
  },
  formData: {
    lastName: "Norris",
    age: 75,
    bio: "Roundhouse kicking asses since 1940",
    password: "noneed",
  },
  "styleSheet": {
    "TextWidget": {
      "input": {
        "borderColor": 'red',
        "borderWidth": 1,
        "borderRadius": 6
      }
    }
  }
};

class WebScreen extends Component {
  public render() {
    return (
      <Fragment>
      <View style={styles.box}></View>
      <View style={styles.notch}>
        <Form 
          schema={schema.schema} 
          // transformErrors={transformErrors} 
          onSubmit={(submited: any)=>{
            Alert.alert(
            "u just submitted",
            JSON.stringify(submited.formData)          )
          }}
          uiSchema={{...schema.uiSchema}}
          submitTitle={"submit"}
          noValidate={false}
          liveValidate={true}
          showErrorList={false} 
        />
      </View>
      </Fragment>
  )
  }
}

const stackNavigator = createSwitchNavigator(
  {
    Index: WebScreen,
  },
  {
    initialRouteName: 'Index',
    headerMode: 'none',

  }
)

const AppNavigator = createBrowserApp(stackNavigator)


class App extends React.Component {
  render() {
    return (
      <AppNavigator />
    );
  }
}

const styles = StyleSheet.create({
  box: { padding: 10, width: '100%', height: '100%', backgroundColor: 'red' },
  text: { fontWeight: 'bold' },
  notch:{
    width: "100%",
    padding: 10,
    overflow: 'hidden',
  }
});


export default App;
