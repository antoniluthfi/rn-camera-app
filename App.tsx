import Geolocation from 'react-native-geolocation-service';
import Permissions, {PermissionStatus} from 'react-native-permissions';
import React from 'react';
import {format, parseISO} from 'date-fns';
import {id} from 'date-fns/locale';
import {launchCamera} from 'react-native-image-picker';
import {
  View,
  Platform,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import Snackbar from 'react-native-snackbar';

const App = () => {
  const [imageSource, setImageSource] = React.useState('');
  const [imageTime, setImageTime] = React.useState('');
  const [latitude, setLatitude] = React.useState(0);
  const [longitude, setLongitude] = React.useState(0);

  const checkLocationPermission = async () => {
    const status: PermissionStatus = await Permissions.request(
      Platform.OS === 'android'
        ? 'android.permission.ACCESS_FINE_LOCATION'
        : 'ios.permission.LOCATION_WHEN_IN_USE',
    );

    return status === 'granted';
  };

  const checkCameraPermission = async () => {
    const status: PermissionStatus = await Permissions.request(
      Platform.OS === 'android'
        ? 'android.permission.CAMERA'
        : 'ios.permission.CAMERA',
    );

    return status === 'granted';
  };

  const openCamera = async () => {
    const cameraPermissionStatus = await checkCameraPermission();
    const locationPermissionStatus = await checkLocationPermission();

    if (cameraPermissionStatus && locationPermissionStatus) {
      launchCamera(
        {mediaType: 'photo', quality: 1, includeExtra: true},
        async res => {
          if (res.assets?.length) {
            Geolocation.getCurrentPosition(
              position => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
              },
              error => {
                // See error code charts below.
                console.log(error.code, error.message);
              },
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );

            setImageSource(res.assets?.[0]?.uri || '');

            const formattedDate = format(
              parseISO(res.assets?.[0]?.timestamp || ''),
              'EEEE, d MMMM yyyy, HH:mm',
              {locale: id},
            );
            setImageTime(formattedDate);
            return;
          }

          if (res.errorMessage) {
            Snackbar.show({
              text: res.errorMessage,
              duration: Snackbar.LENGTH_SHORT,
            });
            return;
          }
        },
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <Text style={styles.titleText}>Aplikasi Kamera</Text>

      {imageSource && (
        <Image
          source={{uri: imageSource}}
          style={styles.image}
          resizeMode="contain"
        />
      )}

      <Text style={styles.titleTextsmall}>Waktu pengambilan</Text>
      <Text style={styles.descriptionText}>{`${imageTime} WITA` || '-'}</Text>

      <Text style={styles.titleTextsmall}>Koordinat lokasi pengambilan</Text>
      <Text style={styles.descriptionText}>
        Lat: {latitude || '-'}, Long: {longitude || '-'}
      </Text>

      <TouchableOpacity style={styles.openCameraButton} onPress={openCamera}>
        <Text style={styles.openCameraLabel}>Buka Kamera</Text>
      </TouchableOpacity>

      <Text style={styles.text}>043008937</Text>
      <Text style={styles.text}>Lintang Luthfiantoni</Text>
      <Text style={styles.text}>UPBJJ UT Banjarmasin</Text>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  titleText: {
    marginBottom: 8,
    marginTop: 16,
    fontSize: 20,
    alignSelf: 'center',
    color: '#000000',
  },
  titleTextsmall: {
    marginTop: 16,
    fontSize: 16,
    alignSelf: 'flex-start',
    color: '#000000',
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 14,
    alignSelf: 'flex-start',
    color: '#000000',
  },
  text: {
    fontSize: 14,
    alignSelf: 'center',
    color: '#000000',
  },
  image: {width: 300, height: 300},
  openCameraButton: {
    width: '100%',
    backgroundColor: '#22C674',
    borderRadius: 4,
    opacity: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    marginVertical: 30,
  },
  openCameraLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
