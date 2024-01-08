import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AiBotComponent } from './ai-bot/ai-bot.component';
import { HeaderComponent } from './header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ImageModule } from 'primeng/image';
import { FooterComponent } from './footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { ProgressBarModule } from 'primeng/progressbar';
import { WalletsService } from '../wallet.service';
import { HdWalletAdapterModule } from "@heavy-duty/wallet-adapter";
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@NgModule({
  declarations: [
    AppComponent,
    AiBotComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    HdWalletAdapterModule.forRoot({ autoConnect: false }),
    BrowserModule,
    AppRoutingModule,
    ImageModule,
    BrowserAnimationsModule,
    ToastModule,
    FormsModule,
    ProgressBarModule,
    ProgressSpinnerModule
  ],
  providers: [WalletsService, MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
