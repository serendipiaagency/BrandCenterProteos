// Mailchimp Integration Module
// This module handles synchronization between Brand Center and Mailchimp

export interface MailchimpConfig {
  apiKey: string
  server: string // e.g., "us1", "us2", etc.
  listId: string // List ID for "BrandCenter" list
}

export interface MailchimpMember {
  email: string
  name: string
  role: string
  region?: string
  country?: string
  distributor?: string
  language?: string
  status: 'subscribed' | 'unsubscribed' | 'pending'
}

/**
 * Subscribe or update a member in Mailchimp list
 */
export async function syncMemberToMailchimp(
  config: MailchimpConfig,
  member: MailchimpMember
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!config.apiKey || !config.listId) {
      console.warn('⚠️ Mailchimp not configured - skipping sync')
      return { success: false, error: 'Mailchimp not configured' }
    }

    const emailHash = await generateEmailHash(member.email)
    
    // Prepare member data with merge fields
    const memberData = {
      email_address: member.email,
      status_if_new: member.status,
      status: member.status,
      merge_fields: {
        FNAME: member.name.split(' ')[0] || '',
        LNAME: member.name.split(' ').slice(1).join(' ') || '',
        ROLE: member.role || '',
        REGION: member.region || '',
        COUNTRY: member.country || '',
        DISTRIB: member.distributor || '',
        LANGUAGE: member.language || 'EN'
      },
      tags: [
        'brandcenter',
        member.role,
        member.region || 'GLOBAL'
      ].filter(Boolean)
    }

    // Use Mailchimp API v3 directly (since SDK doesn't work well in Workers)
    const url = `https://${config.server}.api.mailchimp.com/3.0/lists/${config.listId}/members/${emailHash}`
    
    const response = await fetch(url, {
      method: 'PUT', // PUT creates or updates
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memberData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Mailchimp API error:', errorData)
      return { 
        success: false, 
        error: `Mailchimp error: ${response.status} - ${errorData}` 
      }
    }

    const result = await response.json()
    console.log(`✅ Synced to Mailchimp: ${member.email} (${result.status})`)
    
    return { success: true }

  } catch (error: any) {
    console.error('❌ Error syncing to Mailchimp:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

/**
 * Unsubscribe a member from Mailchimp list
 */
export async function unsubscribeMemberFromMailchimp(
  config: MailchimpConfig,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!config.apiKey || !config.listId) {
      console.warn('⚠️ Mailchimp not configured - skipping unsubscribe')
      return { success: false, error: 'Mailchimp not configured' }
    }

    const emailHash = await generateEmailHash(email)
    
    const url = `https://${config.server}.api.mailchimp.com/3.0/lists/${config.listId}/members/${emailHash}`
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'unsubscribed'
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Mailchimp unsubscribe error:', errorData)
      return { 
        success: false, 
        error: `Mailchimp error: ${response.status} - ${errorData}` 
      }
    }

    console.log(`✅ Unsubscribed from Mailchimp: ${email}`)
    return { success: true }

  } catch (error: any) {
    console.error('❌ Error unsubscribing from Mailchimp:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

/**
 * Check if member exists in Mailchimp list
 */
export async function checkMailchimpMember(
  config: MailchimpConfig,
  email: string
): Promise<{ exists: boolean; status?: string; error?: string }> {
  try {
    if (!config.apiKey || !config.listId) {
      return { exists: false, error: 'Mailchimp not configured' }
    }

    const emailHash = await generateEmailHash(email)
    
    const url = `https://${config.server}.api.mailchimp.com/3.0/lists/${config.listId}/members/${emailHash}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.status === 404) {
      return { exists: false }
    }

    if (!response.ok) {
      const errorData = await response.text()
      return { 
        exists: false, 
        error: `Mailchimp error: ${response.status}` 
      }
    }

    const data = await response.json()
    return { 
      exists: true, 
      status: data.status 
    }

  } catch (error: any) {
    return { 
      exists: false, 
      error: error.message 
    }
  }
}

/**
 * Bulk sync users to Mailchimp (for initial sync or batch updates)
 */
export async function bulkSyncUsersToMailchimp(
  config: MailchimpConfig,
  members: MailchimpMember[]
): Promise<{ 
  success: number; 
  failed: number; 
  errors: string[] 
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  }

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize)
    
    const batchResults = await Promise.all(
      batch.map(member => syncMemberToMailchimp(config, member))
    )

    batchResults.forEach((result, index) => {
      if (result.success) {
        results.success++
      } else {
        results.failed++
        results.errors.push(`${batch[index].email}: ${result.error}`)
      }
    })

    // Rate limiting: wait 100ms between batches
    if (i + batchSize < members.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results
}

/**
 * Generate MD5 hash of email (required by Mailchimp API)
 */
async function generateEmailHash(email: string): Promise<string> {
  const lowercaseEmail = email.toLowerCase().trim()
  
  // Use Web Crypto API (available in Cloudflare Workers)
  const encoder = new TextEncoder()
  const data = encoder.encode(lowercaseEmail)
  const hashBuffer = await crypto.subtle.digest('MD5', data)
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return hashHex
}

/**
 * Get Mailchimp server from API key
 * API keys format: xxxxxxxxxxxxxxxxxxxxx-us1
 */
export function getMailchimpServer(apiKey: string): string {
  const parts = apiKey.split('-')
  return parts.length > 1 ? parts[1] : 'us1'
}
