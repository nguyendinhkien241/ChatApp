import React, { useEffect, useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import { Image, Send, X, Smile, Paperclip, Mic, MicOff, Play, Pause } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';

const ChatInput = () => {
  const [ text, setText ] = useState("");
  const [ imagePreview, setImagePreview ] = useState(null);
  const [ filePreview, setFilePreview ] = useState(null);
  const [ showEmojiPicker, setShowEmojiPicker ] = useState(false);
  const [ isRecording, setIsRecording ] = useState(false);
  const [ audioBlob, setAudioBlob ] = useState(null);
  const [ mediaRecorder, setMediaRecorder ] = useState(null);
  const [ recordingTime, setRecordingTime ] = useState(0);
  const [ isPlayingPreview, setIsPlayingPreview ] = useState(false);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const intervalRef = useRef(null);
  const audioPreviewRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    }
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview({
        data: reader.result,
        name: file.name,
        type: file.type,
        size: file.size
      });
    }
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          // Create object URL for better audio handling
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio();
          audio.src = audioUrl;
          
          const finalizeAudioBlob = (duration) => {
            setAudioBlob({
              data: reader.result,
              duration: duration,
              blob: blob,
              url: reader.result
            });
            URL.revokeObjectURL(audioUrl); // Clean up
          };
          
          audio.onloadedmetadata = () => {
            const duration = audio.duration;
            if (duration && !isNaN(duration) && duration !== Infinity) {
              finalizeAudioBlob(Math.floor(duration));
            } else {
              finalizeAudioBlob(recordingTime);
            }
          };
          
          audio.onerror = () => {
            console.log('Audio metadata loading failed, using recording time');
            finalizeAudioBlob(recordingTime);
          };
          
          // Fallback timeout
          setTimeout(() => {
            if (!audioBlob) {
              console.log('Fallback: using recording time as duration');
              finalizeAudioBlob(recordingTime);
            }
          }, 2000);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast.error('Could not access microphone');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(intervalRef.current);
    }
  };
  
  const onEmojiClick = (emojiObject) => {
    setText(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudioPreview = () => {
    if (audioPreviewRef.current) {
      if (isPlayingPreview) {
        audioPreviewRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        audioPreviewRef.current.play();
        setIsPlayingPreview(true);
      }
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const removeFile = () => {
    setFilePreview(null);
    if(audioInputRef.current) audioInputRef.current.value = "";
  };
  
  const removeAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if(!text.trim() && !imagePreview && !filePreview && !audioBlob) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        file: filePreview,
        audio: audioBlob
      });

      //Clear form
      setText("");
      setImagePreview(null);
      setFilePreview(null);
      setAudioBlob(null);
      setRecordingTime(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (audioInputRef.current) audioInputRef.current.value = "";
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Fail to send message", error);
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className='p-4 w-full'>
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* File Preview */}
      {filePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative bg-base-200 p-3 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-2">
              <Paperclip size={16} />
              <span className="text-sm truncate max-w-[200px]">{filePreview.name}</span>
              <span className="text-xs text-zinc-400">({(filePreview.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
            <button
              onClick={removeFile}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Audio Preview */}
      {audioBlob && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative bg-base-200 p-3 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAudioPreview}
                className="btn btn-sm btn-circle btn-primary"
                type="button"
              >
                {isPlayingPreview ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Audio Recording</span>
                  <span className="text-xs text-zinc-400">({formatTime(audioBlob.duration)})</span>
                </div>
                <div className="text-xs text-zinc-500">Click play to preview</div>
              </div>
              <audio
                ref={audioPreviewRef}
                src={audioBlob.url}
                onEnded={() => setIsPlayingPreview(false)}
              />
            </div>
            <button
              onClick={removeAudio}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Recording Status */}
      {isRecording && (
        <div className="mb-3 flex items-center gap-2 bg-red-100 dark:bg-red-900/20 p-2 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-600 dark:text-red-400">Recording... {formatTime(recordingTime)}</span>
          <button
            onClick={stopRecording}
            className="btn btn-sm btn-circle btn-error ml-auto"
            type="button"
          >
            <MicOff size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className='flex items-center gap-2 relative'>
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-12 left-0 z-50">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
        
        <div className='flex-1 flex gap-2'>
          <div className="relative flex-1">
            <input 
              type="text" 
              className='w-full input rounded-lg input-sm sm:input-md pr-12'
              placeholder='Type a message...'
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={18} className="text-zinc-400 hover:text-yellow-500" />
            </button>
          </div>
          
          {/* Hidden file inputs */}
          <input 
            type="file" 
            accept='image/*'
            className='hidden'
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <input 
            type="file" 
            accept='.pdf,.doc,.docx,.txt,.zip,.rar'
            className='hidden'
            ref={audioInputRef}
            onChange={handleFileChange}
          />
          
          {/* Action buttons */}
          <button
            type="button"
            className={`btn btn-circle btn-sm
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400 hover:text-emerald-500"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={18} />
          </button>
          
          <button
            type="button"
            className={`btn btn-circle btn-sm
                     ${filePreview ? "text-blue-500" : "text-zinc-400 hover:text-blue-500"}`}
            onClick={() => audioInputRef.current?.click()}
          >
            <Paperclip size={18} />
          </button>
          
          <button
            type="button"
            className={`btn btn-circle btn-sm
                     ${isRecording ? "text-red-500" : "text-zinc-400 hover:text-red-500"}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
        
         <button
          type="submit"
          className="btn btn-sm btn-circle btn-primary"
          disabled={!text.trim() && !imagePreview && !filePreview && !audioBlob}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}

export default ChatInput