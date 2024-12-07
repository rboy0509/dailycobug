import React,{FC,useState,useEffect} from 'react'
import {styles} from './CallRoom.styles'
import {View} from 'react-native'
import Daily, {
  DailyMediaView,
  DailyEventObjectParticipant,
  DailyCall,
} from "@daily-co/react-native-daily-js";


interface call {
  type:'video' | 'audio'
}

const roomUrl = 'roomUrl';

const CallRoom:FC<any>=({route,navigation}) =>{
    
  const {call,settings}=route.params



   const [callObject, setCallObject] = useState<DailyCall | null>(null);
   const [participant, setParticipant] = useState(null);

   const [activeVideo, setActiveVideo] = useState(false);
   const [activeAudio, setActiveAudio] = useState(false);

 
  const handleParticipantUpdates = async (event: DailyEventObjectParticipant) => {
    const participant = event.participant;
    // Early out as needed to avoid display the local participant's video
    if (participant.local) {
      setActiveVideo(callObject.localVideo());
      setActiveAudio(callObject.localAudio());
      return;
    }
    setParticipant(participant);
  };

//. Create the callObject 
useEffect(() => {


  const newCallObject = Daily.createCallObject({
    videoSource: call?.type=='video' ? true : false,
    audioSource:  true,
    reactNativeConfig:{
      androidInCallNotification:{disableForCustomOverride:true}
    }
  });

  newCallObject.join({
    url: roomUrl,
    startAudioOff: settings?.audio ? false: true,
    startVideoOff:  settings?.video?  false:true,
  });

    setCallObject(newCallObject);


 
  return () => {
    newCallObject.leave()
    newCallObject.destroy();
  };
}, []);


//Add the listeners
 useEffect(() => {
  if (!callObject) {
    return;
  }
  callObject
    .on("participant-updated", handleParticipantUpdates)
    .on('participant-left',()=>setParticipant(null))
    return () => {
      callObject.off("participant-updated", handleParticipantUpdates); // Clean up event listener
      callObject.off('participant-left',()=>setParticipant(null))
    };
}, [callObject]);



  



const renderParticipantVideo=()=>{


 return <>

 <View style ={{
  overflow:'hidden',
  height:'82%',        
  width:'100%',

}}>
    <DailyMediaView

videoTrack={participant?.tracks?.video?.persistentTrack}
audioTrack={null}
mirror={false}
objectFit='contain'
style={styles.video_container}
/>
</View>
  </>



}

const renderLocalVideo=()=>{



  return <>
  <View  style ={{position:'absolute',bottom:80,right:30,height:150,borderRadius:8,overflow:'hidden',elevation:2,zIndex:3}}>
  
  <DailyMediaView
              videoTrack={callObject?.participants()?.local?.tracks?.video?.persistentTrack}
              audioTrack={null} 
              mirror={true}
              objectFit="contain"
              style={{width:75,height:150}} 
            />
 </View> 
  
  </>




}


//Elems



    return  <>
    

    <View style ={styles.container}>



     


         {renderParticipantVideo()}

         {renderLocalVideo()}





      
    </View>




    
    </> ;
}

export default CallRoom;



