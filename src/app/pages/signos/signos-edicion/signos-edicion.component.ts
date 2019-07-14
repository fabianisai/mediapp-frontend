import { SignosService } from 'src/app/_service/signos.service';
import { Signos } from './../../../_model/signos';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PacienteService } from 'src/app/_service/paciente.service';
import { Paciente } from 'src/app/_model/paciente';
import { Observable } from 'rxjs';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { map } from 'rxjs/operators';
import { PacienteDialogoComponent } from '../../paciente/paciente-dialogo/paciente-dialogo.component';
import { MatDialog, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-signos-edicion',
  templateUrl: './signos-edicion.component.html',
  styleUrls: ['./signos-edicion.component.css']
})
export class SignosEdicionComponent implements OnInit {

  form: FormGroup;
  signos: Signos;
  pacientes: Paciente[] = [];
  edicion: boolean;
  idSignos: number;
  fechaSeleccionada: Date = new Date();
  maxFecha: Date = new Date();
  pacienteSeleccionado: Paciente;
  idPacienteSeleccionado: number;
  myControlPaciente: FormControl = new FormControl();
  filteredOptions: Observable<any[]>
  temperatura:string;
  pulso:string;
  ritmo:string;

  constructor(private snackBar: MatSnackBar, private dialog: MatDialog,private builder: FormBuilder,private signosService: SignosService, private route: ActivatedRoute, private router: Router, private pacienteService: PacienteService) { }

  ngOnInit() {

    this.pacienteService.pacienteCambio.subscribe(data => {
      this.pacientes = data;
    });

    this.pacienteService.mensajeCambio.subscribe(data => {
      this.snackBar.open(data, 'INFO', {
        duration: 2000
      });
    }); 

    this.pacienteService.pacienteNewCambio.subscribe(data => {
      console.log(data);
      this.myControlPaciente = new FormControl(data);
        
      this.form = new FormGroup({
        'idSignos': new FormControl(this.form.value['idSignos']),
        'paciente': this.myControlPaciente,
        'fecha': new FormControl(new Date(this.form.value['fecha'])),
        'temperatura': new FormControl(this.form.value['temperatura']),
        'ritmo': new FormControl(this.form.value['ritmo']),
        'pulso': new FormControl(this.form.value['pulso'])
      });
      this.pacienteSeleccionado=data;
      this.filteredOptions = this.myControlPaciente.valueChanges.pipe(map(val => this.filter(val)));
      });
    
    this.maxFecha.setDate(this.maxFecha.getDate()+364); 

    this.form = this.builder.group({
      'idSignos': new FormControl(0),
      'paciente': this.myControlPaciente,
      'fecha': new FormControl(new Date()),
      'temperatura': new FormControl(),
      'pulso': new FormControl(''),
      'ritmo': new FormControl('')
    });

    this.route.params.subscribe((params: Params) => {
      this.idSignos = params['id'];
      this.edicion = this.idSignos != null;

      this.init();
    });

    this.listarPacientes();
    this.filteredOptions = this.myControlPaciente.valueChanges.pipe(map(val => this.filter(val)));

  }

  init(){
    if (this.edicion) {
      //cargar la data del servicio hacia el form
      this.signosService.listarPorId(this.idSignos).subscribe(data => {
        
        this.myControlPaciente = new FormControl(data.paciente);
        
        this.form = new FormGroup({
          'idSignos': new FormControl(data.idSignos),
          'paciente': this.myControlPaciente,
          'fecha': new FormControl(new Date(data.fecha)),
          'temperatura': new FormControl(data.temperatura),
          'ritmo': new FormControl(data.ritmo),
          'pulso': new FormControl(data.pulso)
        });


          this.signos=data;
          this.fechaSeleccionada=new Date(data.fecha);
          this.pacienteSeleccionado = data.paciente;
          this.filteredOptions = this.myControlPaciente.valueChanges.pipe(map(val => this.filter(val)));



  
      }/*, err => {
        console.log(err.error.mensaje);
      }*/);
    }

  }

  listarPacientes() {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }

  displayFn(val: Paciente) {
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  filter(val: any) {
    if (val != null && val.idPaciente > 0) {
      return this.pacientes.filter(option =>
        option.nombres.toLowerCase().includes(val.nombres.toLowerCase()) || option.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) || option.dni.includes(val.dni));
    } else {
      return this.pacientes.filter(option =>
        option.nombres.toLowerCase().includes(val.toLowerCase()) || option.apellidos.toLowerCase().includes(val.toLowerCase()) || option.dni.includes(val));
    }
  }

  operar(){

    this.signos = new Signos();
    this.signos.idSignos = this.form.value['idSignos']; //this.especialidadSeleccionada;
    this.signos.paciente = this.form.value['paciente'];//this.pacienteSeleccionado;
    var tzoffset = (this.form.value['fecha']).getTimezoneOffset() * 60000;
    var localISOTime = (new Date(Date.now() - tzoffset)).toISOString()
    this.signos.fecha = localISOTime;
    this.signos.temperatura = this.form.value['temperatura'];
    this.signos.ritmo = this.form.value['ritmo'];
    this.signos.pulso = this.form.value['pulso'];

    if(this.edicion){
      this.signosService.modificar(this.signos).subscribe(()=>{
        this.signosService.listar().subscribe(data => {
          this.signosService.signosCambio.next(data);
          this.signosService.mensajeCambio.next('SE MODIFICO');
        });
      });
    }else{
      //insercion
      this.signosService.registrar(this.signos).subscribe(()=>{
        this.signosService.listar().subscribe(data => {
          this.signosService.signosCambio.next(data);
          this.signosService.mensajeCambio.next('SE REGISTRO');
        });
      });
    }
    this.router.navigate(['signos']);
  }

  seleccionarPaciente(e: any) {
    this.pacienteSeleccionado = e.option.value;
  }

  nuevoPaciente(){
    let operar = "nuevo";
    this.dialog.open(PacienteDialogoComponent, {
      width: '250px',
      data: operar
    }) 
  } 

}
