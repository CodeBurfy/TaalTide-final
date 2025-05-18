import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../config/firebase'
import { useSupabase } from './SupabaseContext'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { supabase } = useSupabase()

  // Sync Firebase user with Supabase
  const syncUserWithSupabase = useCallback(async (user) => {
    if (!user) return

    try {
      // Sign in to Supabase with custom token
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.uid // Use Firebase UID as password
      })

      if (signInError) {
        // If sign in fails, try to create the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: user.email,
          password: user.uid,
          options: {
            data: {
              name: user.displayName,
              avatar_url: user.photoURL
            }
          }
        })

        if (signUpError) {
          console.error('Error creating Supabase user:', signUpError)
          return
        }
      }
    } catch (error) {
      console.error('Error syncing user with Supabase:', error)
    }
  }, [supabase])

  // Handle redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result?.user) {
          await syncUserWithSupabase(result.user)
          toast.success('Successfully signed in!')
        }
      } catch (error) {
        console.error('Error handling redirect result:', error)
        toast.error('Failed to complete sign-in. Please try again.')
      }
    }

    handleRedirectResult()
  }, [syncUserWithSupabase])

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      
      try {
        // First try popup
        const result = await signInWithPopup(auth, provider)
        await syncUserWithSupabase(result.user)
        toast.success('Successfully signed in!')
        return result.user
      } catch (popupError) {
        console.log('Popup error:', popupError.code)
        // If popup is blocked or closed, fall back to redirect
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/cancelled-popup-request') {
          toast('Redirecting to Google sign-in page...', {
            duration: 3000
          })
          // Wait for the toast to be visible
          await new Promise(resolve => setTimeout(resolve, 1000))
          await signInWithRedirect(auth, provider)
          return null
        }
        throw popupError
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in cancelled. Please try again.')
      } else {
        toast.error('Failed to sign in. Please try again.')
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [syncUserWithSupabase])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth)
      await supabase.auth.signOut()
      setCurrentUser(null)
      toast.success('Successfully signed out!')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out. Please try again.')
    }
  }, [supabase])

  // Check auth state
  const checkAuthState = useCallback(() => {
    setLoading(true)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)
        await syncUserWithSupabase(user)
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [syncUserWithSupabase])

  // Initial auth check on mount
  useEffect(() => {
    const unsubscribe = checkAuthState()
    return () => unsubscribe()
  }, [checkAuthState])

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut,
    checkAuthState
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}