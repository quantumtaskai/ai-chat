import { ref, onUnmounted } from 'vue'

interface VoiceOptions {
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
}

export function useVoice() {
  // State
  const isSupported = ref(false)
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const isMuted = ref(false)
  
  // Speech Recognition
  let recognition: SpeechRecognition | null = null
  let synthesis: SpeechSynthesis | null = null
  
  // Initialize speech APIs
  function initialize() {
    // Check for Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'en-US'
    }

    // Check for Speech Synthesis support
    if (window.speechSynthesis) {
      synthesis = window.speechSynthesis
    }

    // Enhanced support detection for cross-origin contexts
    const hasSecureContext = window.isSecureContext || location.protocol === 'https:'
    const hasPermissionsAPI = 'permissions' in navigator

    isSupported.value = !!(recognition && synthesis && hasSecureContext)

    // Log initialization status for debugging
    console.log('Voice API Status:', {
      speechRecognition: !!recognition,
      speechSynthesis: !!synthesis,
      secureContext: hasSecureContext,
      permissionsAPI: hasPermissionsAPI,
      supported: isSupported.value
    })
  }
  
  // Speech-to-Text
  function startListening(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!recognition) {
        reject(new Error('Speech recognition not supported in this context. Please ensure you\'re using HTTPS and the site has microphone permissions.'))
        return
      }

      // Check microphone permissions first
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
          if (permission.state === 'denied') {
            reject(new Error('Microphone access denied. Please enable microphone permissions for this site.'))
            return
          }
        }
      } catch (error) {
        console.warn('Unable to check microphone permissions:', error)
      }

      let finalTranscript = ''

      recognition.onstart = () => {
        isListening.value = true
        console.log('Voice recognition started successfully')
      }

      recognition.onresult = (event) => {
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        // You could emit interim results here if needed
      }

      recognition.onend = () => {
        isListening.value = false
        resolve(finalTranscript.trim())
      }

      recognition.onerror = (event) => {
        isListening.value = false
        console.error('Speech recognition error:', event.error, event.message)

        let errorMessage = 'Speech recognition failed'
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.'
            break
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your connection and try again.'
            break
          case 'service-not-allowed':
            errorMessage = 'Speech service not allowed. This may be due to cross-origin restrictions.'
            break
          default:
            errorMessage = `Speech recognition error: ${event.error}`
        }

        reject(new Error(errorMessage))
      }

      try {
        recognition.start()
      } catch (error) {
        isListening.value = false
        reject(new Error(`Failed to start speech recognition: ${error}`))
      }
    })
  }
  
  function stopListening() {
    if (recognition && isListening.value) {
      recognition.stop()
    }
  }
  
  // Text-to-Speech
  function speak(text: string, options: VoiceOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!synthesis) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Skip speaking if muted
      if (isMuted.value) {
        resolve()
        return
      }

      // Skip empty text
      if (!text || text.trim().length === 0) {
        resolve()
        return
      }

      // Cancel any ongoing speech gracefully
      if (isSpeaking.value) {
        synthesis.cancel()
        // Small delay to ensure cancellation completes
        setTimeout(() => {
          startSpeech()
        }, 50)
      } else {
        startSpeech()
      }

      function startSpeech() {
        const utterance = new SpeechSynthesisUtterance(text)

        // Set options
        utterance.rate = options.rate || 1.0
        utterance.pitch = options.pitch || 1.0
        utterance.volume = options.volume || 1.0
        utterance.lang = options.lang || 'en-US'

        // Event handlers
        utterance.onstart = () => {
          isSpeaking.value = true
        }

        utterance.onend = () => {
          isSpeaking.value = false
          resolve()
        }

        utterance.onerror = (event) => {
          isSpeaking.value = false

          // Handle different error types gracefully
          switch (event.error) {
            case 'interrupted':
              // This is normal when speech is cancelled, don't treat as error
              console.log('Speech synthesis interrupted (normal)')
              resolve()
              break
            case 'cancelled':
              // Also normal when speech is cancelled
              console.log('Speech synthesis cancelled (normal)')
              resolve()
              break
            case 'not-allowed':
              reject(new Error('Speech synthesis not allowed. Please check browser permissions.'))
              break
            case 'network':
              reject(new Error('Network error during speech synthesis. Please check your connection.'))
              break
            default:
              // Only reject for actual errors, not interruptions
              console.warn(`Speech synthesis warning: ${event.error}`)
              reject(new Error(`Speech synthesis error: ${event.error}`))
          }
        }

        try {
          synthesis.speak(utterance)
        } catch (error) {
          isSpeaking.value = false
          reject(error)
        }
      }
    })
  }
  
  function stopSpeaking() {
    if (synthesis) {
      synthesis.cancel()
      isSpeaking.value = false
    }
  }

  // Mute controls
  function setMuted(muted: boolean) {
    isMuted.value = muted
    // Stop speaking if currently speaking and being muted
    if (muted && isSpeaking.value) {
      stopSpeaking()
    }
  }

  function toggleMute() {
    setMuted(!isMuted.value)
    return isMuted.value
  }
  
  // Get available voices
  function getVoices(): SpeechSynthesisVoice[] {
    if (!synthesis) return []
    return synthesis.getVoices()
  }
  
  // Utility functions
  function setVoice(voiceName: string) {
    const voices = getVoices()
    const voice = voices.find(v => v.name === voiceName)
    return voice || null
  }
  
  function getPreferredVoice(lang = 'en-US'): SpeechSynthesisVoice | null {
    const voices = getVoices()
    
    // Try to find a voice for the specified language
    const langVoices = voices.filter(voice => voice.lang.startsWith(lang))
    
    if (langVoices.length > 0) {
      // Prefer local voices over remote ones
      const localVoice = langVoices.find(voice => voice.localService)
      return localVoice || langVoices[0]
    }
    
    return voices[0] || null
  }
  
  // Cleanup
  function cleanup() {
    stopListening()
    stopSpeaking()
  }
  
  // Initialize on composable creation
  initialize()
  
  // Cleanup on component unmount
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    // State
    isSupported,
    isListening,
    isSpeaking,
    isMuted,

    // Speech-to-Text
    startListening,
    stopListening,

    // Text-to-Speech
    speak,
    stopSpeaking,

    // Mute controls
    setMuted,
    toggleMute,

    // Voice management
    getVoices,
    setVoice,
    getPreferredVoice,

    // Cleanup
    cleanup
  }
}

// Type declarations for browsers that might not have these
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  readonly isFinal: boolean
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}