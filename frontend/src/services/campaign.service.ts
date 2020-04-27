import axios from 'axios'
import { Campaign, CampaignStats, ChannelType, Status, SMSCampaign, EmailCampaign } from 'classes'

function getSentAt(jobs: Array<{sent_at: Date}>): Date {
  const jobsSentAt = jobs.map((x => x.sent_at)).sort()
  // returns job with the earliest sentAt time
  return jobsSentAt[0]
}

export async function getCampaigns(): Promise<Array<Campaign>> {
  return axios.get('/campaigns').then((response) => {
    const campaigns: Campaign[] = response.data.map((data: any) => {

      const details = {
        ...data,
        sent_at: getSentAt(data.job_queue)
      }
    
      return new Campaign(details)
    })
    return campaigns
  })
}

function parseStatus (status: string) : Status {
  switch (status){
    case 'READY':
    case 'ENQUEUED':
    case 'SENDING':
      return Status.Sending
    case 'SENT':
    case 'LOGGED':
      return Status.Sent
    default: 
      return Status.Draft
  }
}

export async function getCampaignStats(campaignId: number): Promise<CampaignStats> {
  return axios.get(`/campaign/${campaignId}/stats`).then((response) => {
    const { error, unsent, sent, status } = response.data
    const details = { error, unsent, sent, status}
    return new CampaignStats({
      error,
      unsent,
      sent, 
      status: parseStatus(status)
    })
  })
}

export async function getCampaignDetails(campaignId: number): Promise<EmailCampaign | SMSCampaign> {
  return axios.get(`/campaign/${campaignId}`).then((response) => {
    const { campaign, num_recipients } = response.data
    const details = {
      ...campaign,
      num_recipients,
      sent_at:  getSentAt(campaign.job_queue),
    }

    switch(campaign.type){
      case ChannelType.SMS:
        return new SMSCampaign(details)
      case ChannelType.Email:
        return new EmailCampaign(details)
      default:
        throw new Error('Invalid channel type')
    }
  })
}

export async function createCampaign(name: string, type: ChannelType): Promise<Campaign> {
  return axios.post('/campaigns', { name, type }).then(
    (response) => {
      return new Campaign(response.data)
    })
}

export async function sendCampaign(campaignId: number): Promise<boolean> {
  return axios.post(`/campaign/${campaignId}/send`).then((response) => response.status === 200)
}

export async function stopCampaign(campaignId: number): Promise<boolean> {
  return axios.post(`/campaign/${campaignId}/stop`).then((response) => response.status === 200)
}

export async function retryCampaign(campaignId: number): Promise<boolean> {
  return axios.post(`/campaign/${campaignId}/retry`).then((response) => response.status === 200)
}


