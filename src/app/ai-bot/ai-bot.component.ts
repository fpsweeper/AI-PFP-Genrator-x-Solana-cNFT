import { Component } from '@angular/core';
const {bearer, helius_key} = require('../../config.json')
import { MessageService } from 'primeng/api';
import { WalletsService } from '../../wallet.service';

@Component({
  selector: 'app-ai-bot',
  templateUrl: './ai-bot.component.html',
  styleUrls: ['./ai-bot.component.scss'],
  providers: [MessageService]
})
export class AiBotComponent {
  connected = false
  generatedImg = ''
  generateLoading = false
  promptt = ''
  generateModalOpened = false
  walletGeneratedAIImage:any = {}
  walletCreatedCNFTS = {}
  walletModalOpen = false
  generatingCNFT = false
  
  constructor(private messageService: MessageService, public walletService: WalletsService){}

  ngOnInit(){
    if(sessionStorage.getItem('walletAddress')){
      if(sessionStorage.getItem('walletAddress') != ''){
        this.connected = true
      }
      else{
        this.connected = false
      }
    }else{
      this.connected = false
    }
  }

  show(summary:any, text:any) {
    this.messageService.add({ severity: 'success', summary: summary, detail: text });
  }

  generateClicked(){
    if(this.promptt != ''){
      var wall:any = sessionStorage.getItem("walletaddress")
      if(this.walletGeneratedAIImage[wall]){
        this.show('AI PFP Generation', 'You have already reached your limit using this wallet!')
        this.generateModalOpened = false
      }else{
        this.generateLoading = true
        this.getPfp(this.promptt).then((res:any) => {
          this.generatedImg = res.data.data[0].url
          this.generateLoading = false
          this.show('AI PFP Generation', 'AI PFP Generated with success!')
          this.generateModalOpened = false
          this.walletGeneratedAIImage[wall] = new Object()
        })
      } 
    }else{
      this.show('AI PFP Generation', 'Please fill your prompt!')
    } 
  }

  sendConnectedMsg(){
    this.show('Wallet Connection', 'Wallet connected with success!')
  }

  createClicked(){
    if(this.generatedImg === ''){
      this.show('Create cNFT', 'PFP not yet generated!')
    }else{
      if(sessionStorage.getItem("walletaddress")){
        if(sessionStorage.getItem("walletaddress") != '')
          {
            this.generatingCNFT = true
            this.createCNFT().then((res:any) => {
              console.log(res , ' RRRRRRRRRRRRRRRRRRRRRRRR')
              this.show('Create cNFT', 'cNFT generated and sent to your wallet with success!')
              this.generatingCNFT = false
              window.open('https://solscan.io/tx/'+res.signature, "_blank")
            })
          }
        else
          {
            this.walletModalOpen = true
          }
      }
      else
        this.walletModalOpen = true
    }
  }

  async getPfp(prompt:any) {
    return new Promise((resolve, reject) => {
      const axios = require('axios');
  
      const options = {
      method: 'POST',
      url: 'https://api.openai.com/v1/images/generations',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer ' + bearer
      },
      data: {
        "model": "dall-e-3",
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024"
      }
      };
    
      axios
      .request(options)
      .then((response:any)  => {
        resolve(response)
      })
      .catch((error:any) => {
        resolve(null)
      });
    })	
  }

  async createCNFT() {
    return new Promise(async (resolve, reject) => {
      const url = `https://mainnet.helius-rpc.com/?api-key=`+ helius_key;

    await fetch(url, {
        mode: 'no-cors',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'helius-test',
            method: 'mintCompressedNft',
            params: {
                name: 'RZ AI PFP',
                symbol: 'RZPFP',
                owner: sessionStorage.getItem('walletaddress'),
                description:
                    'cNFT AI PFP generated with RevengerZ AI tool',
                imageUrl: this.generatedImg,
                externalUrl: 'https://revengerz.xyz',
                sellerFeeBasisPoints: 10000,
                creators:[
                    {
                        address: "EkbneJGpfuAHxx3JJZDL9raXUwNgVNJVkLFPZQez6pTC",
                        share: 100
                    }
                ]
            },
        }),
    })
    .then(function(response) {
        console.log(response.json() , ' HHHHHHHHHHH');
    })
    .then(function(json) {
      console.log(json , ' AAAAAAAAAAAAA')
      resolve(json)
    })
    .catch(function(err) {
        console.log(`Error: ${err}`)
    });
    /*const { result } = await response.json();
    resolve(result)*/
    })	
  }

  openGenerateModal(){
    if(sessionStorage.getItem("walletaddress")){
      if(sessionStorage.getItem("walletaddress") != '')
        this.generateModalOpened = true
      else
        {
          this.walletModalOpen = true
        }
    }
    else
      this.walletModalOpen = true
  }

  closeGenerateModal(){
    this.generateModalOpened = false
    this.walletModalOpen = false
  }

  async walletConnect(wallet:any){
    await this.walletService.onSelectWallet(wallet.adapter.name); 
    console.log('sssssssssssfdsf')
    await this.walletService.onConnect().then(() => {
      this.walletModalOpen = false; 
      this.sendConnectedMsg()
    }); 
  }
}
